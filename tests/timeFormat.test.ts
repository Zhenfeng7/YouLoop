import { describe, expect, it } from 'vitest';
import { secondsToTimestamp, timestampToSeconds } from '../src/content/utils/timeFormat';

describe('secondsToTimestamp', () => {
  it('formats seconds without hours', () => {
    expect(secondsToTimestamp(65)).toBe('01:05');
  });

  it('formats seconds with hours', () => {
    expect(secondsToTimestamp(3605)).toBe('01:00:05');
  });

  it('guards against invalid values', () => {
    expect(secondsToTimestamp(-5)).toBe('00:00');
  });
});

describe('timestampToSeconds', () => {
  it('parses mm:ss format', () => {
    expect(timestampToSeconds('01:30')).toBe(90);
  });

  it('parses hh:mm:ss format', () => {
    expect(timestampToSeconds('01:01:01')).toBe(3661);
  });

  it('rejects invalid strings', () => {
    expect(timestampToSeconds('abc')).toBeNull();
    expect(timestampToSeconds('01::00')).toBeNull();
  });
});
