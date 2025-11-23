
# YouTube Loop Extension MVP - Task Breakdown

### Task 1: **Set up project environment**
- **Description**: Initialize the project with TypeScript, bundler, and necessary dependencies.
- **Start**: Run `npm init` and install dependencies.
- **End**: The project should be ready to build and run with a basic folder structure.
- **Test**: Verify that `package.json` and `tsconfig.json` are properly configured and no errors when running `npm run build`.

---

### Task 2: **Create basic folder structure**
- **Description**: Create the following folders in the project:
  - `src/content/` (for content scripts).
  - `src/shared/` (for shared logic like types and utilities).
  - `src/background/` (for background scripts).
  - `tests/` (for tests).
- **Start**: Create the folders and empty files.
- **End**: Ensure that the folders and initial files are created.
- **Test**: Check the folder structure in the project directory.

---

### Task 3: **Create manifest.json**
- **Description**: Set up a basic `manifest.json` file for the extension with `manifest_version: 3`.
- **Start**: Define `name`, `version`, and `description` in `manifest.json`.
- **End**: Manifest should be valid and include content script configurations for YouTube.
- **Test**: Run the extension in Chrome and verify it loads without errors.

---

### Task 4: **Create Content Script Entry Point (`index.ts`)**
- **Description**: Create the initial entry point for the content script (`index.ts`) and link it to `manifest.json`.
- **Start**: Create an empty `index.ts` in `src/content/`.
- **End**: Ensure the content script runs without doing anything yet.
- **Test**: Verify that the content script loads on a YouTube page and outputs a console log (`console.log('Content script loaded')`).

---

### Task 5: **Add YouTube player detection**
- **Description**: Write a helper function in `YoutubePlayerService.ts` to detect the `<video>` element on the YouTube page.
- **Start**: Use `document.querySelector` to find the `<video>` element.
- **End**: Return the `<video>` element or `null` if not found.
- **Test**: Verify that the correct video element is detected on a YouTube page.

---

### Task 6: **Inject loop icon into player bar**
- **Description**: Modify `UiManager.ts` to inject a loop icon into the YouTube player controls bar.
- **Start**: Add a small `<button>` with an icon into the player bar (using `document.querySelector`).
- **End**: The loop icon should appear in the YouTube video player bar.
- **Test**: Verify that the loop icon is visible and properly injected into the player.

---

### Task 7: **Create LoopConfig type**
- **Description**: Define a `LoopConfig` type in `LoopConfig.ts` to hold start time, end time, and loop state.
- **Start**: Write an interface for `LoopConfig` with properties: `startTime`, `endTime`, `enabled`, etc.
- **End**: `LoopConfig` should be ready to store and manage loop state.
- **Test**: Ensure the type works correctly and is used properly in the project (e.g., assign values to `LoopConfig`).

---

### Task 8: **Create LoopController (skeleton)**
- **Description**: Create a basic `LoopController.ts` file with an empty `startLoop` and `stopLoop` method.
- **Start**: Define the skeleton of the `LoopController` class with basic methods.
- **End**: The `LoopController` class should be created with no logic inside the methods yet.
- **Test**: Ensure that the `LoopController` can be instantiated and the methods exist.

---

### Task 9: **Loop button click event (UI)**
- **Description**: In `LoopButton.ts`, add a click event listener that toggles the loop icon state (active/inactive).
- **Start**: Add an event listener to the loop icon button.
- **End**: Toggle the icon’s class between active/inactive when clicked.
- **Test**: Verify that clicking the loop icon toggles its state.

---

### Task 10: **Handle start/end time input in dropdown**
- **Description**: In `LoopDropdown.ts`, add input fields for `startTime` and `endTime` in `hh:mm:ss` format.
- **Start**: Add two input fields for the user to type in start and end times.
- **End**: Input fields should allow users to type in the loop times.
- **Test**: Ensure that the input fields accept time in `hh:mm:ss` format.

---

### Task 11: **Create `startLoop` method**
- **Description**: Implement the `startLoop` method in `LoopController.ts` to start looping when valid start and end times are provided.
- **Start**: Implement basic time checking and looping logic in `startLoop`.
- **End**: The loop should jump back to the start time once the video reaches the end time.
- **Test**: Play a YouTube video and test if the video loops back to the start time.

---

### Task 12: **Detect and suspend loop during ad playback**
- **Description**: In `AdObserver.ts`, detect when an ad is showing and suspend the loop.
- **Start**: Implement a `MutationObserver` to detect the `ad-showing` class on the player container.
- **End**: When an ad is detected, call `LoopController.suspend()`.
- **Test**: Verify that the loop is suspended when an ad plays.

---

### Task 13: **Resume loop after ad finishes**
- **Description**: In `AdObserver.ts`, resume the loop when an ad finishes.
- **Start**: Implement logic in `AdObserver.ts` to detect when the ad ends and call `LoopController.resume()`.
- **End**: The loop should resume once the ad finishes.
- **Test**: Play a video with ads and verify that the loop resumes after the ad.

---

### Task 14: **SPA navigation detection and reset loop**
- **Description**: In `SpaObserver.ts`, detect when the user navigates to a new video on the same page and reset the loop state.
- **Start**: Implement a `MutationObserver` to detect changes in the URL or the video player.
- **End**: The loop should be reset when navigating to a new video.
- **Test**: Verify that the loop is reset when the user clicks on a new video on YouTube.

---

### Task 15: **Test complete loop behavior**
- **Description**: Test the entire loop functionality.
- **Start**: Manually test the extension with a YouTube video, start and end times, ad detection, and SPA navigation.
- **End**: Ensure that the loop works as expected with all features in place (looping, ad detection, SPA reset).
- **Test**: Confirm that the video loops, suspends during ads, resumes after ads, and resets when navigating to a new video.

---

### Task 16: **Polish UI (icon, dropdown, styles)**
- **Description**: Improve the UI by adding basic styles for the loop button and dropdown.
- **Start**: Write styles for the loop button and dropdown in `styles.css`.
- **End**: The UI should be visually appealing and match YouTube’s dark theme.
- **Test**: Verify that the loop button and dropdown are visually consistent with YouTube’s UI.

---

### Task 17: **Write unit tests for LoopController**
- **Description**: Write unit tests for the `LoopController` class to verify the loop logic.
- **Start**: Write tests to verify `startLoop`, `stopLoop`, `suspend`, and `resume` methods.
- **End**: The tests should pass successfully.
- **Test**: Run tests and verify that `LoopController` works as expected.

---

### Task 18: **Write integration tests for loop behavior**
- **Description**: Write integration tests to simulate user interaction with the loop button and dropdown.
- **Start**: Write tests for clicking the loop icon, setting start/end times, and verifying the loop behavior.
- **End**: The tests should pass and verify that the UI and loop logic are working together.
- **Test**: Run tests and verify that the entire loop functionality works with the UI.

---

### Task 19: **Prepare for deployment (final check)**
- **Description**: Finalize all code, clean up any unused files, and make sure the extension is ready for deployment.
- **Start**: Review all code and remove unnecessary comments or debug code.
- **End**: The code should be clean, organized, and ready for release.
- **Test**: Ensure that the extension runs smoothly and is fully functional.
