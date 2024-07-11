import type { PendingActivity, PendingNexusOperation } from '$lib/types/events';
import type { WorkflowEvent } from '$lib/types/events';

import {
  isActivityTaskScheduledEvent,
  isNexusOperationScheduledEvent,
} from './is-event-type';

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

export const getPendingNexusOperation = (
  event: WorkflowEvent,
  pendingNexusOperations: PendingNexusOperation[],
): PendingNexusOperation | undefined => {
  let pendingOperation: PendingNexusOperation | undefined;

  // TODO: Add this when PendingNexusOperation has scheduledEventId
  if (isNexusOperationScheduledEvent(event)) {
    pendingOperation = pendingNexusOperations.find(
      (_) => false,
      // (p) => p.scheduledEventId === event.id,
    );
  }

  return pendingOperation;
};
