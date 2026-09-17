import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
import { toActivityStatus } from '$lib/utilities/get-activity-status-and-count';
import type { QuickFilterValue } from '$lib/utilities/query/quick-filter';

export const ACTIVITY_COLUMN_ATTRIBUTE: Record<string, string> = {
  'Activity ID': 'ActivityId',
  'Run ID': 'RunId',
  Type: 'ActivityType',
  'Task Queue': 'TaskQueue',
  Status: 'ExecutionStatus',
  Start: 'StartTime',
  End: 'CloseTime',
  'Execution Time': 'ExecutionTime',
  'State Transitions': 'StateTransitionCount',
};

// Execution Duration is derived rather than read from the activity, and its
// ExecutionDuration attribute is indexed in nanoseconds, so there is no value
// to filter by.
export const UNFILTERABLE_ACTIVITY_COLUMNS = ['Execution Duration'];

export const getActivityColumnAttribute = (label: string): string =>
  ACTIVITY_COLUMN_ATTRIBUTE[label] ?? label;

export const getActivityColumnValue = (
  label: string,
  activity: ActivityExecutionInfo,
): QuickFilterValue => {
  switch (label) {
    case 'Activity ID':
      return activity.activityId;
    case 'Run ID':
      return activity.runId;
    case 'Type':
      return activity.activityType?.name;
    case 'Task Queue':
      return activity.taskQueue;
    case 'Status':
      return toActivityStatus(activity.status);
    case 'Start':
      return activity.scheduleTime;
    case 'End':
      return activity.closeTime;
    case 'Execution Time':
      return activity.executionTime;
    case 'State Transitions':
      return activity.stateTransitionCount;
    default:
      return undefined;
  }
};
