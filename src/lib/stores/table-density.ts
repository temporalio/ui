import { persistStore } from './persist-store';

type TableDensity = 'compact' | 'comfortable';
export const tableDensity = persistStore<TableDensity>(
  'tableDensity',
  'comfortable',
  true,
);
