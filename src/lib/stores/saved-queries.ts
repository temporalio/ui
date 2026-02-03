import type { IconName } from '$lib/holocene/icon';
import { TASK_FAILURES_QUERY } from '$lib/utilities/workflow-task-failures';

import { persistStore } from './persist-store';

export type SavedQuery = {
  id: string;
  name: string;
  query: string;
  icon?: IconName;
  count?: number;
  badge?: string;
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

export const DEFAULT_SYSTEM_VIEW: SavedQuery = {
  id: 'all',
  name: 'All Workflows',
  query: '',
  icon: 'workflow',
  type: 'system',
};

export const TASK_FAILURES_VIEW: SavedQuery = {
  id: 'task-failures',
  name: 'Task Failures',
  query: TASK_FAILURES_QUERY,
  icon: 'happy-lappy',
  type: 'system',
};

export const systemWorkflowViews: SavedQuery[] = [
  DEFAULT_SYSTEM_VIEW,
  TASK_FAILURES_VIEW,
  {
    id: 'running',
    name: 'Running',
    query: '`ExecutionStatus`="Running"',
    icon: 'heartbeat',
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

export const MAX_SAVED_WORKFLOW_QUERIES = 20;

export const savedWorkflowQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-workflow-queries',
  {},
  true,
);

// Activity-specific saved queries
export const DEFAULT_ACTIVITY_SYSTEM_VIEW: SavedQuery = {
  id: 'all',
  name: 'All',
  query: '',
  icon: 'activity',
  type: 'system',
};

export const systemActivityViews: SavedQuery[] = [
  DEFAULT_ACTIVITY_SYSTEM_VIEW,
  {
    id: 'running',
    name: 'Running',
    query: '`ExecutionStatus`="Running"',
    icon: 'heartbeat',
    type: 'system',
  },
  {
    id: 'completed',
    name: 'Completed',
    query: '`ExecutionStatus`="Completed"',
    icon: 'circle-check',
    type: 'system',
  },
  {
    id: 'failed',
    name: 'Failed',
    query: '`ExecutionStatus`="Failed"',
    icon: 'error',
    type: 'system',
  },
];

export const MAX_SAVED_ACTIVITY_QUERIES = 20;

export const savedActivityQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-activity-queries',
  {},
  true,
);
