const prefix = '[YouTubeLooper]';

type LogMethod = (...args: unknown[]) => void;

const makeLogger = (method: LogMethod) => (...args: unknown[]): void => {
  method(prefix, ...args);
};

export const log = {
  info: makeLogger(console.log),
  warn: makeLogger(console.warn),
  error: makeLogger(console.error),
  debug: makeLogger(console.debug)
};
