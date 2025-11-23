export interface LoopConfig {
  startTime: number | null;
  endTime: number | null;
}

export const defaultLoopConfig: LoopConfig = {
  startTime: null,
  endTime: null
};
