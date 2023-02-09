import type { UserSettings } from '$lib/models/core-user';
import { persistStore } from './persist-store';

export const userSettings = persistStore<UserSettings>(
  'userSettings',
  {},
);
