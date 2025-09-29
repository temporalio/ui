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

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
};

const getLastHour = () => {
  const lastHour = new Date();
  lastHour.setHours(lastHour.getHours() - 1);
  lastHour.setSeconds(0, 0);
  return lastHour.toISOString();
};

export const systemWorkflowViews: SavedQuery[] = [
  {
    id: 'all',
    name: 'All Workflows',
    query: '',
    icon: 'workflow',
    type: 'system',
  },
  {
    id: 'child-workflows',
    name: 'Parent Workflows',
    query: '`ParentWorkflowId` is null',
    icon: 'relationship',
    type: 'system',
  },
  {
    id: 'running',
    name: 'Running',
    query: '`ExecutionStatus`="Running"',
    icon: 'heartbeat',
    type: 'system',
  },
  {
    id: 'today',
    name: 'Today',
    query: `StartTime >= "${getToday()}"`,
    icon: 'calendar',
    type: 'system',
  },
  {
    id: 'last-hour',
    name: 'Last Hour',
    query: `StartTime >= "${getLastHour()}"`,
    icon: 'clock',
    type: 'system',
  },
];

export const MAX_SAVED_WORKFLOW_QUERIES = 2;

export const savedWorkflowQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-workflow-queries',
  {},
  true,
);
