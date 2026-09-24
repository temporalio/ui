import { persistStore } from './persist-store';

export const dismissedUpgradeNotices = persistStore<string[]>(
  'dismissedUpgradeNotices',
  [],
);
