import { LoopController } from '../loop/LoopController';
import { LoopState } from '../loop/LoopState';
import { LoopButton } from './LoopButton';
import { LoopDropdown } from './LoopDropdown';
import { YoutubePlayerService } from '../youtube/YoutubePlayerService';

export class UiManager {
  private loopButton: LoopButton | null = null;

  private dropdown: LoopDropdown | null = null;

  private mounted = false;

  private unsubscribeLoop?: () => void;
  private outsideClickBound = false;

  constructor(
    private readonly playerService: YoutubePlayerService,
    private readonly loopController: LoopController
  ) {}

  mount(): boolean {
    if (this.mounted) return true;

    const controls = this.playerService.getControlsBar();
    const player = this.playerService.getPlayerContainer();
    if (!controls || !player) {
      return false;
    }

    this.loopButton = new LoopButton({ onToggle: this.handleButtonToggle });
    this.loopButton.mount(controls);

    this.dropdown = new LoopDropdown({
      onStartLoop: this.handleStartLoop,
      onStopLoop: this.handleStopLoop,
      getVideoDuration: () => this.playerService.getVideoElement()?.duration ?? null
    });
    this.dropdown.mount(player);

    this.unsubscribeLoop?.();
    this.unsubscribeLoop = this.loopController.subscribe((state) => this.handleLoopStateChange(state));
    this.mounted = true;
    return true;
  }

  unmount(): void {
    this.unsubscribeLoop?.();
    this.unsubscribeLoop = undefined;
    this.loopButton?.destroy();
    this.dropdown?.element.remove();
    this.dropdown = null;
    this.loopButton = null;
    this.mounted = false;
    this.unbindOutsideClick();
  }

  private handleButtonToggle = (isActive: boolean): void => {
    if (!this.dropdown || !this.loopButton) return;

    if (this.loopController.isLoopActive()) {
      this.loopController.stopLoop('user');
      this.dropdown.setVisible(true);
      this.loopButton.setActive(false);
      this.bindOutsideClick();
      return;
    }

    if (isActive) {
      this.dropdown.setVisible(true);
      this.bindOutsideClick();
    } else {
      this.closeDropdown();
    }
  };

  private handleStartLoop = ({ startTime, endTime }: { startTime: number; endTime: number }): void => {
    this.loopController.updateConfig({ startTime, endTime });
    const started = this.loopController.startLoop();
    if (started) {
      this.closeDropdown();
    }
  };

  private handleStopLoop = (): void => {
    this.loopController.stopLoop('user');
    this.closeDropdown();
  };

  private handleLoopStateChange(state: LoopState): void {
    this.loopButton?.setActive(state.active);
    this.loopButton?.setSuspended(state.suspended);
    this.dropdown?.setTimes(state.config.startTime, state.config.endTime);
  }

  private closeDropdown(): void {
    if (!this.dropdown) return;
    this.dropdown.setVisible(false);
    this.unbindOutsideClick();
    if (!this.loopController.isLoopActive()) {
      this.loopButton?.setActive(false);
    }
  }

  private bindOutsideClick(): void {
    if (this.outsideClickBound) return;
    document.addEventListener('mousedown', this.handleDocumentClick);
    this.outsideClickBound = true;
  }

  private unbindOutsideClick(): void {
    if (!this.outsideClickBound) return;
    document.removeEventListener('mousedown', this.handleDocumentClick);
    this.outsideClickBound = false;
  }

  private handleDocumentClick = (event: MouseEvent): void => {
    const target = event.target as Node;
    if (!target) return;
    if (this.dropdown?.element.contains(target)) return;
    if (this.loopButton?.element.contains(target)) return;
    this.closeDropdown();
  };
}
