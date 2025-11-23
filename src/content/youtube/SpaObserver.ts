export type NavigationCallback = () => void;

export class SpaObserver {
  private observer: MutationObserver | null = null;

  private lastUrl: string = window.location.href;

  constructor(private readonly onNavigate: NavigationCallback) {}

  start(): void {
    if (this.observer) {
      return;
    }

    this.observer = new MutationObserver(() => {
      if (this.lastUrl === window.location.href) {
        return;
      }
      this.lastUrl = window.location.href;
      this.onNavigate();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
