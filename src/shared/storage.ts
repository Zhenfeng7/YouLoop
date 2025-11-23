import { StoredLoopConfig } from './types';

const KEY_PREFIX = 'loop-config:';

const buildKey = (videoId: string) => `${KEY_PREFIX}${videoId}`;

export const saveLoopConfig = async (videoId: string, config: StoredLoopConfig): Promise<void> => {
  if (!chrome?.storage?.local) {
    return;
  }

  await chrome.storage.local.set({
    [buildKey(videoId)]: config
  });
};

export const loadLoopConfig = async (videoId: string): Promise<StoredLoopConfig | null> => {
  if (!chrome?.storage?.local) {
    return null;
  }

  const result = await chrome.storage.local.get(buildKey(videoId));
  const config = (result?.[buildKey(videoId)] ?? null) as StoredLoopConfig | null;
  return config;
};
