import type { ClassNameValue } from 'tailwind-merge';

import type { IconName } from '$lib/holocene/icon';

import { persistStore } from './persist-store';

export type SavedQuery = {
  id: string;
  name: string;
  query: string;
  icon?: IconName;
  count?: number;
  badge?: string;
  class?: ClassNameValue;
  disabled?: boolean;
};

export const savedQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-namespace-queries',
  {},
  true,
);
