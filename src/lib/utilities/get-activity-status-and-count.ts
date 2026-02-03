import type { ActivityExecutionStatus } from '$lib/types/activity-execution';
import { decodePayload } from '$lib/utilities/decode-payload';

export type ActivityStatus =
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Canceled'
  | 'Terminated'
  | 'TimedOut';

export const activityStatuses: ActivityStatus[] = [
  'Running',
  'Completed',
  'Failed',
  'Canceled',
  'Terminated',
  'TimedOut',
];

const executionStatusToActivityStatus: Record<
  ActivityExecutionStatus,
  ActivityStatus
> = {
  ACTIVITY_EXECUTION_STATUS_UNSPECIFIED: 'Running',
  ACTIVITY_EXECUTION_STATUS_RUNNING: 'Running',
  ACTIVITY_EXECUTION_STATUS_COMPLETED: 'Completed',
  ACTIVITY_EXECUTION_STATUS_FAILED: 'Failed',
  ACTIVITY_EXECUTION_STATUS_CANCELED: 'Canceled',
  ACTIVITY_EXECUTION_STATUS_TERMINATED: 'Terminated',
  ACTIVITY_EXECUTION_STATUS_TIMED_OUT: 'TimedOut',
};

export const toActivityStatus = (
  status: ActivityExecutionStatus,
): ActivityStatus => {
  return executionStatusToActivityStatus[status] || 'Running';
};

export const getActivityStatusAndCountOfGroup = (groups = []) => {
  return groups
    .map((group) => {
      const rawStatus = decodePayload(
        group?.groupValues[0],
      ) as unknown as ActivityStatus;
      const count = parseInt(group.count);
      return {
        status: rawStatus,
        count,
      };
    })
    .sort((a, b) => {
      return (
        activityStatuses.indexOf(a.status) - activityStatuses.indexOf(b.status)
      );
    });
};

export const isActivityTerminable = (
  status: ActivityExecutionStatus,
): boolean => {
  return status === 'ACTIVITY_EXECUTION_STATUS_RUNNING';
};

export const isActivityCancelable = (
  status: ActivityExecutionStatus,
): boolean => {
  return status === 'ACTIVITY_EXECUTION_STATUS_RUNNING';
};
