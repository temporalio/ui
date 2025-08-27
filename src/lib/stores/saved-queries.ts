import { persistStore } from './persist-store';

export type SavedQuery = {
  id: string;
  name: string;
  query: string;
};

export const savedQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-namespace-queries',
  {},
  true,
);
