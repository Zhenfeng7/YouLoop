import { describe, expect, it, vi } from 'vitest';
import { LoopController } from '../src/content/loop/LoopController';

const createMockVideo = (duration = 120) => {
  const listeners = new Map<string, Set<EventListener>>();

  const on = (event: string) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    return listeners.get(event)!;
  };

  const video = {
    currentTime: 0,
    duration,
    paused: false,
    play: vi.fn(() => Promise.resolve()),
    addEventListener: (event: string, listener: EventListener) => {
      on(event).add(listener);
    },
    removeEventListener: (event: string, listener: EventListener) => {
      on(event).delete(listener);
    },
    emit: (event: string) => {
      on(event).forEach((listener) => listener(new Event(event)));
    }
  } as unknown as HTMLVideoElement & { emit: (event: string) => void; currentTime: number; paused: boolean };

  return video;
};

describe('LoopController', () => {
  it('starts and stops loop with valid configuration', () => {
    const video = createMockVideo();
    const controller = new LoopController({ toleranceSeconds: 0 });
    controller.setVideoElement(video);
    controller.updateConfig({ startTime: 10, endTime: 20 });
    expect(controller.startLoop()).toBe(true);
    controller.stopLoop('user');
    expect(controller.isLoopActive()).toBe(false);
  });

  it('loops back to start when reaching end', () => {
    const video = createMockVideo();
    video.currentTime = 19;

    const controller = new LoopController({ toleranceSeconds: 0 });
    controller.setVideoElement(video);
    controller.updateConfig({ startTime: 10, endTime: 20 });
    controller.startLoop();

    video.currentTime = 20;
    video.emit('timeupdate');

    expect(video.currentTime).toBe(10);
  });

  it('does not loop when suspended', () => {
    const video = createMockVideo();
    const controller = new LoopController({ toleranceSeconds: 0 });
    controller.setVideoElement(video);
    controller.updateConfig({ startTime: 5, endTime: 10 });
    controller.startLoop();
    controller.suspend('ad');

    video.currentTime = 10;
    video.emit('timeupdate');

    expect(video.currentTime).toBe(10);
  });

  it('fails to start when end time exceeds duration', () => {
    const video = createMockVideo(15);
    const controller = new LoopController();
    controller.setVideoElement(video);
    controller.updateConfig({ startTime: 5, endTime: 20 });

    expect(controller.startLoop()).toBe(false);
    expect(controller.isLoopActive()).toBe(false);
  });
});
