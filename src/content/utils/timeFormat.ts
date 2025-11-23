const pad = (value: number): string => value.toString().padStart(2, '0');

export const secondsToTimestamp = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${pad(minutes)}:${pad(secs)}`;
};

export const timestampToSeconds = (value: string): number | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^[0-9:]+$/.test(trimmed)) {
    return null;
  }

  const segments = trimmed.split(':');
  if (segments.some((segment) => segment.length === 0)) {
    return null;
  }

  let multiplier = 1;
  let total = 0;

  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const parsed = Number.parseInt(segments[i], 10);
    if (Number.isNaN(parsed)) {
      return null;
    }
    total += parsed * multiplier;
    multiplier *= 60;
  }

  return total;
};
