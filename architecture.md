
# YouTube Loop Extension – Architecture

## 1. Goals & Non-Goals

### Goals

- Let users define a **custom loop segment** (start time, end time) on a YouTube video.
- Loop that segment **accurately and smoothly** until the user stops.
- **Respect YouTube’s playback speed** – never override the user’s chosen speed.
- Work reliably with **YouTube’s SPA navigation** (no full page reloads between videos).
- Be **ad-safe**:
  - Do **not** block or skip ads.
  - **Suspend** loop logic when ads are playing so we don’t fight with YouTube or ad-blockers.
- Provide a **minimal, non-intrusive UI**:
  - Small loop icon in the player bar.
  - Dropdown panel with loop controls.
  - **No browser action popup**.

### Non-Goals

- Not an ad blocker or playback enhancer (no speed control, no quality control).
- No YouTube Shorts support (focus on regular videos first).
- No complicated global settings UI at this stage (can be added later via options page).
- No cross-device sync of loops (only per-tab, per-session logic for now).

---

## 2. High-Level Architecture

**Manifest V3 Chrome Extension** with:

- **Content Script** (core of the extension)
  - Injected into `https://www.youtube.com/*`.
  - Contains:
    - `LoopController` (loop logic).
    - YouTube integration (video element locator, SPA navigation observer, ad state observer).
    - UI injection (loop icon + dropdown).
- **(Optional / Future) Background Service Worker**
  - Initially minimal or empty.
  - Reserved for future features (global shortcuts, persisted settings, etc.).
- **Shared Utilities**
  - Type definitions (`LoopConfig`, `LoopState`).
  - Storage helpers (wrap `chrome.storage`).
  - Messaging types between content and background (future).

Data flow (simplified):

1. **Content script loads** on a YouTube watch page.
2. It **finds the `<video>` element** and player controls.
3. It **injects** the loop icon and dropdown UI into the YouTube player bar.
4. When the user configures and starts a loop:
   - UI sends config to `LoopController`.
   - `LoopController` listens to `timeupdate` events and jumps `currentTime` between start/end.
5. A **SPA observer** detects video changes:
   - Re-attaches to the new video element.
   - Resets loop state for the new video.
6. An **ad observer** detects ad playback:
   - Temporarily **suspends** loop logic.
   - Resumes loop when main content is back.

---

## 3. Repository & Folder Structure

```text
youtube-loop-extension/
├─ package.json
├─ tsconfig.json
├─ vite.config.mts          # or webpack.config.ts – bundler of choice
├─ README.md
├─ public/
│  ├─ manifest.json
│  └─ icons/
│     ├─ icon16.png
│     ├─ icon32.png
│     ├─ icon48.png
│     └─ icon128.png
├─ src/
│  ├─ content/
│  │  ├─ index.ts           # Content script entrypoint
│  │  ├─ loop/
│  │  │  ├─ LoopController.ts
│  │  │  ├─ LoopConfig.ts
│  │  │  └─ LoopState.ts
│  │  ├─ youtube/
│  │  │  ├─ YoutubePlayerService.ts
│  │  │  ├─ SpaObserver.ts
│  │  │  └─ AdObserver.ts
│  │  ├─ ui/
│  │  │  ├─ UiManager.ts
│  │  │  ├─ LoopButton.ts
│  │  │  ├─ LoopDropdown.ts
│  │  │  └─ styles.css
│  │  └─ utils/
│  │     ├─ dom.ts
│  │     ├─ timeFormat.ts
│  │     └─ logging.ts
│  ├─ background/
│  │  └─ serviceWorker.ts   # minimal now, future expansion
│  └─ shared/
│     ├─ types.ts
│     ├─ storage.ts
│     └─ messaging.ts       # types + helpers (future-friendly)
└─ tests/
   ├─ LoopController.test.ts
   └─ timeFormat.test.ts
```

### Top-Level Files

- **package.json**
  - Dependencies (TypeScript, bundler, test framework).
  - Build scripts (`build`, `watch`, `lint`).

- **tsconfig.json**
  - TypeScript configuration:
    - `target` & `lib` (e.g., `ES2020`, `DOM`).
    - Path aliases (e.g., `@content/*`, `@shared/*`).

- **vite.config.mts / webpack.config.ts**
  - Bundler config to build:
    - `src/content/index.ts` → `dist/content.js` (content script).
    - `src/background/serviceWorker.ts` → `dist/background.js` (service worker).
    - Copies `public/manifest.json` and icons into `dist/`.

- **public/manifest.json**
  - Chrome MV3 manifest.
  - Declares:
    - `content_scripts` for YouTube.
    - `background.service_worker`.
    - `host_permissions` for `https://www.youtube.com/*`.
    - `permissions` (e.g., `"storage"` for saving settings).

---

## 4. Manifest Design (MV3)

**public/manifest.json** (conceptual structure):

- **`manifest_version`: 3**
- **`name`, `version`, `description`** – metadata.
- **`action`** – *omitted* or minimal (no popup).
- **`content_scripts`**:
  - `matches`: `["https://www.youtube.com/*"]`
  - `js`: `["content.js"]`
  - `run_at`: `"document_idle"` (after main DOM is ready).
- **`background`**:
  - `service_worker`: `"background.js"`
- **`permissions`**:
  - `"storage"` (for saving future default behavior / settings).
- **`host_permissions`**:
  - `["https://www.youtube.com/*"]`
- **`icons`**:
  - 16/32/48/128 px icons.

---

## 5. Content Script Architecture (`src/content`)

### 5.1 Content Script Entry – `index.ts`

**Responsibility**

- Acts as the **composition root** in the YouTube page.
- Initializes services and wires them together.

**Major steps (pseudo-flow)**

1. Wait for DOM readiness (`document.readyState` or `DOMContentLoaded`).
2. Instantiate **YouTube integration services**:
   - `YoutubePlayerService`
   - `SpaObserver`
   - `AdObserver`
3. Locate the `<video>` element and player container.
4. Instantiate `LoopController` with the video element.
5. Instantiate `UiManager` and inject the UI.
6. Subscribe to:
   - SPA navigation events → re-initialize services for new video.
   - Ad state events → suspend/resume loop logic.

---

### 5.2 Loop Logic – `loop/LoopController.ts`, `LoopConfig.ts`, `LoopState.ts`

#### `LoopConfig.ts`

Defines the configuration needed for loop behavior:

```ts
export interface LoopConfig {
  enabled: boolean;
  startTime: number | null;       // seconds
  endTime: number | null;         // seconds

  // Future features:
  maxLoops?: number | null;       // e.g. 5 loops, null = infinite
  loopsCompleted?: number;        // internal counter

  durationLimitMs?: number | null;
  loopStartWallTime?: number | null;

  suspended?: boolean;            // ad / navigation suspension
  suspendReason?: 'ad' | 'navigation' | 'user';
}
```

#### `LoopState.ts`

- Holds the **current runtime state** per video:
  - Current config (`LoopConfig`).
  - Reference to the active `HTMLVideoElement`.
  - Whether the `timeupdate` listener is attached.

#### `LoopController.ts`

**Responsibility**

- Purely handle **time-based loop logic** on a single `<video>` element.
- **Does not** know about YouTube DOM details (ads, SPA, etc.) – that’s delegated to other services.

**Key methods**

- `attachVideo(video: HTMLVideoElement)`: bind to a video element and add `timeupdate` listener.
- `detachVideo()`: remove listeners and reset state.
- `updateConfig(partial: Partial<LoopConfig>)`: update loop settings.
- `startLoop()`: validate config, enable looping.
- `stopLoop(reason?: 'user' | 'navigation')`: disable looping.
- `suspend(reason: 'ad' | 'navigation')`: temporarily pause loop jumps.
- `resume()`: resume loop if `enabled` and config is still valid.

**Core logic (simplified)**

On every `timeupdate`:

```ts
if (!config.enabled || config.suspended) return;
if (config.startTime == null || config.endTime == null) return;

const t = video.currentTime;

if (t >= config.endTime) {
  // Jump back to start of loop
  video.currentTime = config.startTime;

  // Future: loop count or duration logic
}
```

Future logic (loop count, loop duration) builds on this by inspecting `loopsCompleted`, `durationLimitMs`, and `Date.now()`.

---

#### 5.3 YouTube Integration – `youtube/` Folder

#### 5.3.1 `YoutubePlayerService.ts`

**Responsibility**

- Encapsulate **how to find and interact** with YouTube’s player & `<video>` element.
- Provide methods like:
  - `getVideoElement(): HTMLVideoElement | null`
  - `getPlayerContainer(): HTMLElement | null` (e.g., controls bar)
- Provide **helpers**:
  - `onPlayerReady(callback)` – wait until video + controls exist.
  - `isAdShowing()` – **optional** helper using YouTube’s CSS classes (e.g., `ad-showing` on the player container).

**Why separate this?**

- Keeps all **YouTube-specific selectors** in one place.
- If YouTube changes DOM structure, only this module likely needs updates.

---

#### 5.3.2 `SpaObserver.ts`

**Problem**

- YouTube is a **Single Page Application**:
  - When you click a new video, the page often doesn’t fully reload.
  - We need to detect **video changes** and reattach the loop logic.

**Responsibility**

- Detect **navigation events** that indicate a new video:
  - Listen for custom events like `yt-navigate-finish` (if available).
  - Fallback: monitor `location.href` and/or mutations to main content.

**API**

```ts
export class SpaObserver {
  constructor(
    private onNewVideo: () => void
  ) {}

  start(): void;
  stop(): void;
}
```

- On detecting a new video:
  - Call `onNewVideo()`.
  - The content script re-runs `YoutubePlayerService.getVideoElement()` → re-attaches `LoopController` to the new video.
  - `LoopController` resets `enabled` to `false` for the new video.

---

#### 5.3.3 `AdObserver.ts`

**Goal**

- Make loop logic **ad-safe**:
  - Do not jump inside ads.
  - Avoid conflicts with ad-blockers or YouTube’s internal behavior.

**Behavior**

- Observe the player container for **ad-related DOM changes**, e.g.:
  - A CSS class like `ad-showing` on `#movie_player` or some child.
- When ad starts:
  - Call `LoopController.suspend('ad')`.
- When ad ends:
  - Call `LoopController.resume()`.

**Implementation Outline**

```ts
export class AdObserver {
  constructor(
    private playerContainer: HTMLElement,
    private onAdStart: () => void,
    private onAdEnd: () => void
  ) {}

  start(): void;
  stop(): void;
}
```

- Internal:
  - `MutationObserver` that tracks class changes on the container.
  - Checks presence of ad markers (`.ad-showing`, `.video-ads`, etc.).
- The **extension does not**:
  - Skip ads.
  - Change playback rate.
  - Force play/pause.

---

#### 5.4 UI Layer – `ui/` Folder

#### 5.4.1 `UiManager.ts`

**Responsibility**

- High-level orchestration of UI components:
  - Inject loop button into YouTube’s control bar.
  - Show / hide the dropdown panel.
  - Bridge user actions → `LoopController`.

**Key responsibilities**

- On initialization:
  - Use `YoutubePlayerService.getPlayerContainer()` to find control bar.
  - Create DOM elements for:
    - Loop icon/button.
    - Dropdown panel container (positioned around the player).
- Coordinate child components:
  - `LoopButton` (icon).
  - `LoopDropdown` (form for start/end times and buttons).

**Interactions**

- Subscribes to events from `LoopButton` & `LoopDropdown`.
- Calls:
  - `LoopController.updateConfig(...)`
  - `LoopController.startLoop()`
  - `LoopController.stopLoop()`

---

#### 5.4.2 `LoopButton.ts`

**Responsibility**

- Represent the **small loop icon** in the YouTube control bar.
- Provide a clear state:
  - **Inactive** (loop not enabled).
  - **Active** (loop enabled).
  - **Suspended** (during ads or navigation; optional style).

**Behavior**

- Single click:
  - If dropdown is closed → open dropdown.
  - When loop is active:
    - Option A (chosen by you earlier): **Clicking the icon toggles “pause/stop loop”**.
      - For now, treat as **stop**: `LoopController.stopLoop('user')`.
      - UI updates to “inactive” state.

(You can also refine later to separate “pause” and “reset”, but architecture just needs event hooks.)

---

#### 5.4.3 `LoopDropdown.ts`

**Responsibility**

- Provide the details for the loop configuration.

**Fields & Controls**

- **Start time** (`hh:mm:ss`)
- **End time** (`hh:mm:ss`)
- Buttons:
  - **Set from current time** (optional future improvement).
  - **Start Loop**
  - **Stop Loop**

**Workflow**

1. User opens dropdown (via loop button).
2. User enters start and end times (e.g., `01:30`, `01:45`).
3. On **Start Loop**:
   - Dropdown validates:
     - Valid numeric times.
     - `start < end`.
   - Emits an event:
     - `onStartLoop(startSeconds, endSeconds)`.
   - UIManager calls:
     - `LoopController.updateConfig({ startTime, endTime })`
     - `LoopController.startLoop()`.
4. On **Stop Loop**:
   - Calls `LoopController.stopLoop('user')`.
