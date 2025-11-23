type Callback = () => void;

const AD_CLASS = 'ad-showing';
const AD_CONTAINER_SELECTOR = '.video-ads';

export class AdObserver {
  private observer: MutationObserver | null = null;

  private running = false;

  private adActive = false;

  constructor(
    private playerContainer: HTMLElement,
    private readonly onAdStart: Callback,
    private readonly onAdEnd: Callback
  ) {}

  setPlayerContainer(container: HTMLElement): void {
    if (this.playerContainer === container) return;
    this.stop();
    this.playerContainer = container;
    if (this.running) {
      this.start();
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.observer = new MutationObserver(() => this.evaluate());
    this.observer.observe(this.playerContainer, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
      childList: true
    });
    this.evaluate();
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.running = false;
    this.adActive = false;
  }

  private evaluate(): void {
    const hasAdClass = this.playerContainer.classList.contains(AD_CLASS);
    const adContainers = this.playerContainer.querySelectorAll(AD_CONTAINER_SELECTOR);
    const hasAd = hasAdClass || adContainers.length > 0;

    if (hasAd && !this.adActive) {
      this.adActive = true;
      this.onAdStart();
      return;
    }

    if (!hasAd && this.adActive) {
      this.adActive = false;
      this.onAdEnd();
    }
  }
}
