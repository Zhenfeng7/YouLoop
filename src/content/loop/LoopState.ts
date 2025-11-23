import { LoopConfig, defaultLoopConfig } from './LoopConfig';

export type LoopSuspensionReason = 'ad' | 'navigation';
export type LoopStopReason = 'user' | 'navigation' | 'ad' | 'unknown';

export interface LoopState {
  config: LoopConfig;
  active: boolean;
  suspended: boolean;
  suspensionReason: LoopSuspensionReason | null;
}

export const defaultLoopState: LoopState = {
  config: { ...defaultLoopConfig },
  active: false,
  suspended: false,
  suspensionReason: null
};
