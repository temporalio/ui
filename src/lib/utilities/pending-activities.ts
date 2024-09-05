import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { isEvent } from '$lib/models/event-history';
import type {
  PendingActivity,
  PendingNexusOperation,
  WorkflowEventWithPending,
} from '$lib/types/events';
import type { WorkflowEvent } from '$lib/types/events';

import {
  isActivityTaskScheduledEvent,
  isNexusOperationScheduledEvent,
} from './is-event-type';
import {
  isPendingActivity,
  isPendingNexusOperation,
} from './is-pending-activity';

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

  if (isNexusOperationScheduledEvent(event)) {
    pendingOperation = pendingNexusOperations.find(
      (p) => p.scheduledEventId === event.id,
    );
  }

  return pendingOperation;
};

export const getGroupForEventOrPendingEvent = (
  groups: EventGroup[],
  event: WorkflowEventWithPending,
) => {
  return groups.find((g) => {
    if (isEvent(event)) {
      return g.eventIds.has(event.id);
    } else if (isPendingActivity(event)) {
      return g.pendingActivity?.id === event.id;
    } else if (isPendingNexusOperation(event)) {
      return (
        g?.pendingNexusOperation?.scheduledEventId === event?.scheduledEventId
      );
    }
  });
};
