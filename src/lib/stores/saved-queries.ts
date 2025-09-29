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
  active?: boolean;
  type?: string;
};

export const MAX_SAVED_WORKFLOW_QUERIES = 2;

export const savedWorkflowQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-workflow-queries',
  {},
  true,
);
