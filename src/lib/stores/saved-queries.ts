import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  type IconComponent,
  IconExclamationCircle,
  IconExclamationOctagon,
  IconHappyLappy,
  IconHeartbeat,
  IconPause,
  IconRelationship,
  IconTemporalActivity,
  IconTemporalNexus,
  IconTemporalSchedules,
  IconTemporalWorker,
  IconTemporalWorkflow,
} from '$lib/io/icon';
import { TASK_FAILURES_QUERY } from '$lib/utilities/workflow-task-failures';

import { persistStore } from './persist-store';

export type SavedQuery = {
  id: string;
  name: string;
  query: string;
  Icon?: IconComponent;
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

export const DEFAULT_WORKFLOW_SYSTEM_VIEW: SavedQuery = {
  id: 'all',
  name: 'All',
  query: '',
  Icon: IconTemporalWorkflow,
  type: 'system',
};

const TASK_FAILURES_VIEW: SavedQuery = {
  id: 'task-failures',
  name: 'Failures',
  query: TASK_FAILURES_QUERY,
  Icon: IconHappyLappy,
  type: 'system',
};

const systemWorkflowViews: SavedQuery[] = [
  DEFAULT_WORKFLOW_SYSTEM_VIEW,
  {
    id: 'running',
    name: 'Running',
    query: '`ExecutionStatus`="Running"',
    Icon: IconHeartbeat,
    type: 'system',
  },
  {
    id: 'child-workflows',
    name: 'Parent',
    query: '`ParentWorkflowId` is null',
    Icon: IconRelationship,
    type: 'system',
  },
  {
    id: 'today',
    name: 'Today',
    query: `StartTime >= "${getToday()}"`,
    Icon: IconCalendar,
    type: 'system',
  },
  {
    id: 'last-hour',
    name: 'Last 1h',
    query: `StartTime >= "${getLastHour()}"`,
    Icon: IconClock,
    type: 'system',
  },
];

export const getSystemWorkflowViews = (
  hasTaskFailureAttribute: boolean,
  taskFailuresCount: number,
): SavedQuery[] => {
  const [defaultView, ...rest] = systemWorkflowViews;
  return [
    defaultView,
    ...(hasTaskFailureAttribute
      ? [
          {
            ...TASK_FAILURES_VIEW,
            count: taskFailuresCount,
            Icon:
              taskFailuresCount > 0
                ? IconExclamationOctagon
                : TASK_FAILURES_VIEW.Icon,
          },
        ]
      : []),
    ...rest,
  ];
};

export const MAX_SAVED_QUERIES = 50;

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
  Icon: IconTemporalActivity,
  type: 'system',
};

export const systemActivityViews: SavedQuery[] = [
  DEFAULT_ACTIVITY_SYSTEM_VIEW,
  {
    id: 'running',
    name: 'Running',
    query: '`ExecutionStatus`="Running"',
    Icon: IconHeartbeat,
    type: 'system',
  },
  {
    id: 'completed',
    name: 'Completed',
    query: '`ExecutionStatus`="Completed"',
    Icon: IconCheckCircle,
    type: 'system',
  },
  {
    id: 'failed',
    name: 'Failed',
    query: '`ExecutionStatus`="Failed"',
    Icon: IconExclamationCircle,
    type: 'system',
  },
];

export const savedActivityQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-activity-queries',
  {},
  true,
);

// Nexus operation saved queries
export const DEFAULT_NEXUS_SYSTEM_VIEW: SavedQuery = {
  id: 'all',
  name: 'All',
  query: '',
  Icon: IconTemporalNexus,
  type: 'system',
};

export const systemNexusViews: SavedQuery[] = [
  DEFAULT_NEXUS_SYSTEM_VIEW,
  {
    id: 'today',
    name: 'Today',
    query: `StartTime >= "${getToday()}"`,
    Icon: IconCalendar,
    type: 'system',
  },
  {
    id: 'last-hour',
    name: 'Last Hour',
    query: `StartTime >= "${getLastHour()}"`,
    Icon: IconClock,
    type: 'system',
  },
];

export const savedNexusQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-nexus-queries',
  {},
  true,
);

// Worker saved queries
export const DEFAULT_WORKER_SYSTEM_VIEW: SavedQuery = {
  id: 'all',
  name: 'All',
  query: '',
  Icon: IconTemporalWorker,
  type: 'system',
};

export const systemWorkerViews: SavedQuery[] = [
  DEFAULT_WORKER_SYSTEM_VIEW,
  {
    id: 'running',
    name: 'Running',
    query: '`WorkerStatus`="Running"',
    Icon: IconHeartbeat,
    type: 'system',
  },
];

export const savedWorkerQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-worker-queries',
  {},
  true,
);

// Schedule saved queries
export const DEFAULT_SCHEDULE_SYSTEM_VIEW: SavedQuery = {
  id: 'all',
  name: 'All',
  query: '',
  Icon: IconTemporalSchedules,
  type: 'system',
};

export const systemScheduleViews: SavedQuery[] = [
  DEFAULT_SCHEDULE_SYSTEM_VIEW,
  {
    id: 'paused',
    name: 'Paused',
    query: '`TemporalSchedulePaused`=true',
    Icon: IconPause,
    type: 'system',
  },
];

export const savedScheduleQueries = persistStore<Record<string, SavedQuery[]>>(
  'saved-schedule-queries',
  {},
  true,
);
