import { persistStore } from './persist-store';

export const featureFlags = persistStore<Record<string, boolean>>(
  'featureFlags',
  { eventHistoryV2: false },
);
