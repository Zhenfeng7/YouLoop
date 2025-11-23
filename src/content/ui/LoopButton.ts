export type LoopButtonOptions = {
  onToggle: (isActive: boolean) => void;
};

export class LoopButton {
  readonly element: HTMLButtonElement;

  private isActive = false;

  private isSuspended = false;

  constructor(private readonly options: LoopButtonOptions) {
    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = 'yl-loop-button';
    this.element.title = 'Loop segment';
    this.element.innerHTML = `
      <svg class="yl-loop-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path
          d="M7 6h7a4 4 0 1 1 0 8H8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 4l-3 2 3 2"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17 18h-7a4 4 0 1 1 0-8h6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M16 20l3-2-3-2"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
    this.element.addEventListener('click', this.handleClick);
  }

  mount(parent: HTMLElement): void {
    parent.prepend(this.element);
  }

  setActive(active: boolean): void {
    this.isActive = active;
    this.syncState();
  }

  setSuspended(suspended: boolean): void {
    this.isSuspended = suspended;
    this.syncState();
  }

  toggle(): void {
    this.isActive = !this.isActive;
    this.syncState();
    this.options.onToggle(this.isActive);
  }

  destroy(): void {
    this.element.removeEventListener('click', this.handleClick);
    this.element.remove();
  }

  private handleClick = (event: MouseEvent): void => {
    event.preventDefault();
    this.toggle();
  };

  private syncState(): void {
    this.element.classList.toggle('is-active', this.isActive);
    this.element.classList.toggle('is-suspended', this.isSuspended);
  }
}
