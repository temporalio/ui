import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
import { isFuture } from '$lib/utilities/format-date';

export const isActivityDelayed = (activity: ActivityExecutionInfo): boolean => {
  return !!activity.executionTime && isFuture(activity.executionTime);
};
