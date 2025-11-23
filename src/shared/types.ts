export interface LoopTimes {
  startTime: number;
  endTime: number;
}

export interface StoredLoopConfig extends Partial<LoopTimes> {
  videoId: string;
}
