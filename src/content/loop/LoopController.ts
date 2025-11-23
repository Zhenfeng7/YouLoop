import { LoopConfig, defaultLoopConfig } from './LoopConfig';
import { LoopState, LoopSuspensionReason, LoopStopReason } from './LoopState';

export interface LoopControllerOptions {
  toleranceSeconds?: number;
}

export type LoopStateListener = (state: LoopState) => void;

export class LoopController {
  private config: LoopConfig = { ...defaultLoopConfig };

  private active = false;

  private suspendedReason: LoopSuspensionReason | null = null;

  private video: HTMLVideoElement | null = null;

  private readonly toleranceSeconds: number;

  private readonly listeners = new Set<LoopStateListener>();

  private readonly handleTimeUpdate = (): void => {
    if (!this.active || this.suspendedReason) return;
    const video = this.video;
    if (!video) return;
    const { startTime, endTime } = this.config;
    if (startTime == null || endTime == null) return;

    // If user seeks outside the segment, deactivate the loop.
    if (video.currentTime < startTime - this.toleranceSeconds || video.currentTime > endTime + this.toleranceSeconds) {
      this.stopLoop('user');
      return;
    }

    if (video.currentTime >= endTime - this.toleranceSeconds) {
      video.currentTime = startTime;
      if (video.paused) {
        void video.play().catch(() => undefined);
      }
    }
  };

  constructor(options: LoopControllerOptions = {}) {
    this.toleranceSeconds = options.toleranceSeconds ?? 0.05;
  }

  setVideoElement(video: HTMLVideoElement | null): void {
    if (this.video === video) return;
    if (this.video) {
      this.video.removeEventListener('timeupdate', this.handleTimeUpdate);
    }
    this.video = video;
    if (this.active && this.video) {
      this.video.addEventListener('timeupdate', this.handleTimeUpdate);
    }
  }

  subscribe(listener: LoopStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  updateConfig(partial: Partial<LoopConfig>): void {
    this.config = { ...this.config, ...partial };
    this.emit();
  }

  startLoop(): boolean {
    if (!this.video) return false;
    const { startTime, endTime } = this.config;
    if (startTime == null || endTime == null) return false;
    if (startTime >= endTime) return false;
    const duration = this.video.duration;
    if (Number.isFinite(duration)) {
      if (endTime > duration || startTime >= duration) {
        return false;
      }
    }
    if (this.active) return true;

    if (this.video.currentTime < startTime - this.toleranceSeconds || this.video.currentTime > endTime + this.toleranceSeconds) {
      this.video.currentTime = startTime;
    }

    this.video.addEventListener('timeupdate', this.handleTimeUpdate);
    this.active = true;
    this.emit();
    return true;
  }

  stopLoop(_reason: LoopStopReason = 'user'): void {
    if (!this.active) return;
    if (this.video) {
      this.video.removeEventListener('timeupdate', this.handleTimeUpdate);
    }
    this.active = false;
    this.suspendedReason = null;
    this.emit();
  }

  suspend(reason: LoopSuspensionReason): void {
    if (this.suspendedReason === reason) return;
    this.suspendedReason = reason;
    this.emit();
  }

  resume(): void {
    if (!this.suspendedReason) return;
    this.suspendedReason = null;
    this.emit();
  }

  reset(): void {
    if (this.video) {
      this.video.removeEventListener('timeupdate', this.handleTimeUpdate);
    }
    this.config = { ...defaultLoopConfig };
    this.active = false;
    this.suspendedReason = null;
    this.emit();
  }

  isLoopActive(): boolean {
    return this.active;
  }

  getState(): LoopState {
    return {
      config: { ...this.config },
      active: this.active,
      suspended: Boolean(this.suspendedReason),
      suspensionReason: this.suspendedReason
    };
  }

  private emit(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}
