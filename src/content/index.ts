import { LoopController } from './loop/LoopController';
import { UiManager } from './ui/UiManager';
import { YoutubePlayerService } from './youtube/YoutubePlayerService';
import { SpaObserver } from './youtube/SpaObserver';
import { AdObserver } from './youtube/AdObserver';
import { log } from './utils/logging';
import { injectStyles } from './utils/dom';
import uiStyles from './ui/styles.css?inline';

const playerService = new YoutubePlayerService();
const loopController = new LoopController();
const uiManager = new UiManager(playerService, loopController);

injectStyles('youtube-looper-styles', uiStyles);
let adObserver: AdObserver | null = null;

const setupVideo = async (): Promise<void> => {
  const video = await playerService.waitForVideoElement();
  loopController.setVideoElement(video);
  uiManager.mount();
};

const initialize = async (): Promise<void> => {
  try {
    await setupVideo();
  } catch (error) {
    log.error('Unable to locate video element', error);
    return;
  }

  const refreshAdObserver = (): void => {
    const playerContainer = playerService.getPlayerContainer();
    if (!playerContainer) return;

    if (adObserver) {
      adObserver.setPlayerContainer(playerContainer);
    } else {
      adObserver = new AdObserver(
        playerContainer,
        () => loopController.suspend('ad'),
        () => loopController.resume()
      );
    }
    adObserver.start();
  };

  refreshAdObserver();

  const spaObserver = new SpaObserver(async () => {
    log.info('Detected YouTube SPA navigation. Resetting loop state.');
    uiManager.unmount();
    loopController.reset();
    await setupVideo();
    refreshAdObserver();
  });
  spaObserver.start();
};

void initialize();
