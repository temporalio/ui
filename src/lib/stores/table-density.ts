import { persistStore } from './persist-store';

export type TableDensity = 'dense' | 'comfortable';
export const tableDensity = persistStore<TableDensity>(
  'tableDensity',
  'comfortable',
  true,
);
