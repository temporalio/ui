import { persistStore } from './persist-store';

type TableDensity = 'dense' | 'comfortable';
export const tableDensity = persistStore<TableDensity>(
  'tableDensity',
  'comfortable',
  true,
);
