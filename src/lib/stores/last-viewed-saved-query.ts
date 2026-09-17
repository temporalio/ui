import { persistStore } from './persist-store';

export type LastViewedSavedQueryIds = Record<string, Record<string, string>>;

export const lastViewedSavedQueryIds = persistStore<LastViewedSavedQueryIds>(
  'last-viewed-saved-query-ids',
  {},
  true,
);
