import { persistStore } from './persist-store';

export const resetWorkflows = persistStore<Record<string, string>>(
  'resetWorkflows',
  {},
);
