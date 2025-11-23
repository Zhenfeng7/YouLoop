import { waitForElement } from '../utils/dom';

const VIDEO_SELECTOR = 'video.html5-main-video';
const PLAYER_SELECTOR = '#movie_player';
const CONTROLS_SELECTOR = '.ytp-right-controls';

export class YoutubePlayerService {
  getVideoElement(): HTMLVideoElement | null {
    return document.querySelector<HTMLVideoElement>(VIDEO_SELECTOR);
  }

  async waitForVideoElement(): Promise<HTMLVideoElement> {
    return waitForElement<HTMLVideoElement>(VIDEO_SELECTOR);
  }

  getPlayerContainer(): HTMLElement | null {
    return document.querySelector<HTMLElement>(PLAYER_SELECTOR);
  }

  getControlsBar(): HTMLElement | null {
    return document.querySelector<HTMLElement>(CONTROLS_SELECTOR);
  }
}
