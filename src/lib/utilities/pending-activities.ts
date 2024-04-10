import type { PendingActivity } from '$lib/types/events';
import type { WorkflowEvent } from '$lib/types/events';

import { isActivityTaskScheduledEvent } from './is-event-type';

export const getPendingActivity = (
  event: WorkflowEvent,
  pendingActivities: PendingActivity[],
): PendingActivity | undefined => {
  let pendingActivity: PendingActivity | undefined;

  if (isActivityTaskScheduledEvent(event)) {
    pendingActivity = pendingActivities.find(
      (p) => p.activityId === event.attributes.activityId,
    );
  }

  return pendingActivity;
};

export const isAssociatedPendingActivity = (
  event: WorkflowEvent,
  pendingActivity: PendingActivity | undefined,
): boolean => {
  if (isActivityTaskScheduledEvent(event) && pendingActivity) {
    return pendingActivity.activityId === event.attributes.activityId;
  }

  return false;
};
