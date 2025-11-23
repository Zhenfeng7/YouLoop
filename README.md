# YouTube Looper Extension

Loop any segment of a standard YouTube video without touching playback speed. This Manifest V3 extension injects a minimal control into the YouTube player so you can pick precise start/end times, suspend during ads, and survive SPA navigation.

## Features
- **Inline UI** – Loop button sits next to native controls; dropdown stays inside the player.
- **Precise timing** – Hours/minutes/seconds inputs with validation and keyboard fixes so YouTube shortcuts do not interfere.
- **Ad-safe** – Mutation observers pause loops when ads play and resume afterwards.
- **SPA aware** – Detects YouTube’s single-page navigation, reattaches to the new video element, and resets state.
- **Typed codebase & tests** – TypeScript + Vitest unit/integration coverage for utilities, loop logic, and UI flow.

## Project Structure
```
youtube-looper/
├─ public/             # manifest + icons copied to dist/
├─ src/
│  ├─ content/         # content script entry + UI, loop, youtube integration
│  ├─ background/      # placeholder MV3 service worker
│  └─ shared/          # cross-context utilities (types, storage, messaging)
├─ tests/              # Vitest suites
├─ vite.config.mts     # Vite build for content/background
├─ vitest.config.ts    # jsdom test environment
└─ tsconfig.json
```

## Screenshots & Demo
Add screenshots or GIFs once you capture them:

| Dropdown & Button | Looping Segment |
| --- | --- |
| ![Loop button screenshot](docs/screenshot-loop-button.png) | ![Loop playback gif](docs/looping-demo.gif) |

> Place your assets in `docs/` (or update the paths) and re-run `npm run build` to capture any new UI states.

Once the Chrome Web Store listing is approved, append a badge under the title:

```markdown
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/<YOUR_ITEM_ID>?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/<YOUR_ITEM_ID>)
```

## Getting Started
```bash
npm install
```

### Available Scripts
- `npm run dev` – Vite watch build (content + background).
- `npm run build` – Production build to `dist/` + copies manifest/icons.
- `npm run lint` – Type-check via `tsc --noEmit`.
- `npm test` – Vitest (jsdom) with watch mode. Use `npm test -- --run` for single run.

### Manual Testing on YouTube
1. `npm run build`
2. Open Chrome → `chrome://extensions` → enable Developer Mode.
3. Click **Load unpacked** and select the `dist/` folder.
4. Open a standard YouTube video (not Shorts). A loop icon appears near the captions/settings controls.
5. Click the icon, enter start/end times (hh/mm/ss), hit “Start Loop”. Verify jumping, ad suspension, SPA navigation, and outside-click closing.
6. Press the reload arrow on the extension card whenever you rebuild.

## Packaging for Chrome Web Store
1. Run `npm run build` and verify `dist/` contents (manifest must be at root).
2. Zip the *contents* of `dist/` (select all files inside, compress to `youtube-looper.zip`).
3. Prepare assets: icon set (16/32/48/128) and at least one 1280×800 screenshot/GIF of the dropdown.
4. In the Chrome Web Store Developer Console, create a new item, upload the zip, fill out description/keywords/privacy statement, and submit for review.
5. After approval, update this README with the Chrome Web Store badge/link and share the URL on the GitHub repo.

## Roadmap
- Options page for global defaults or saved loops.
- Additional UI polish (progress indicator, keyboard shortcuts).
- Sync loop settings per video via storage.

## License
MIT (adjust as needed).
