import { describe, expect, it, vi } from 'vitest';
import { UiManager } from '../src/content/ui/UiManager';
import { YoutubePlayerService } from '../src/content/youtube/YoutubePlayerService';
import { LoopController } from '../src/content/loop/LoopController';

const setupDom = () => {
  document.body.innerHTML = `
    <div id="movie_player" class="html5-video-player">
      <div class="ytp-right-controls"></div>
    </div>
  `;
  const video = document.createElement('video');
  video.className = 'html5-main-video';
  Object.defineProperty(video, 'play', {
    value: vi.fn(() => Promise.resolve()),
    writable: true
  });
  document.body.appendChild(video);
  return video;
};

describe('UI integration', () => {
  it('allows configuring loop through dropdown', () => {
    const video = setupDom();
    const playerService = new YoutubePlayerService();
    const controller = new LoopController({ toleranceSeconds: 0 });
    controller.setVideoElement(video);

    const uiManager = new UiManager(playerService, controller);
    expect(uiManager.mount()).toBe(true);

    const button = document.querySelector<HTMLButtonElement>('.yl-loop-button');
    expect(button).not.toBeNull();
    button!.click();

    const inputs = document.querySelectorAll<HTMLInputElement>('.yl-loop-input');
    expect(inputs.length).toBe(6);
    inputs[0].value = '0'; // start hours
    inputs[1].value = '0'; // start minutes
    inputs[2].value = '5'; // start seconds
    inputs[3].value = '0'; // end hours
    inputs[4].value = '0'; // end minutes
    inputs[5].value = '10'; // end seconds

    const form = document.querySelector<HTMLFormElement>('.yl-loop-form');
    expect(form).not.toBeNull();
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(controller.isLoopActive()).toBe(true);
  });

  it('closes dropdown when clicking outside', () => {
    setupDom();
    const playerService = new YoutubePlayerService();
    const controller = new LoopController({ toleranceSeconds: 0 });

    const uiManager = new UiManager(playerService, controller);
    expect(uiManager.mount()).toBe(true);

    const button = document.querySelector<HTMLButtonElement>('.yl-loop-button');
    button?.click();

    const dropdown = document.querySelector('.yl-loop-dropdown')!;
    expect(dropdown.classList.contains('is-visible')).toBe(true);

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(dropdown.classList.contains('is-visible')).toBe(false);
  });

  it('prevents starting loop beyond video duration', () => {
    const video = setupDom();
    Object.defineProperty(video, 'duration', { value: 8, writable: true });
    const playerService = new YoutubePlayerService();
    const controller = new LoopController({ toleranceSeconds: 0 });
    controller.setVideoElement(video);

    const uiManager = new UiManager(playerService, controller);
    expect(uiManager.mount()).toBe(true);

    const button = document.querySelector<HTMLButtonElement>('.yl-loop-button');
    button?.click();

    const inputs = document.querySelectorAll<HTMLInputElement>('.yl-loop-input');
    inputs[0].value = '0';
    inputs[1].value = '0';
    inputs[2].value = '5';
    inputs[3].value = '0';
    inputs[4].value = '0';
    inputs[5].value = '12'; // longer than duration

    const form = document.querySelector<HTMLFormElement>('.yl-loop-form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(controller.isLoopActive()).toBe(false);
    const dropdown = document.querySelector('.yl-loop-dropdown')!;
    expect(dropdown.classList.contains('is-visible')).toBe(true);
  });
});
