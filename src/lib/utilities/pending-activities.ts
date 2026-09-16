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
      (p) => String(p.scheduledEventId) === event.id,
    );
  }

  return pendingOperation;
};

export const getGroupForEventOrPendingEvent = (
  groups: EventGroup[] | Map<string, EventGroup>,
  event: WorkflowEventWithPending,
): EventGroup | undefined => {
  if (isEvent(event)) {
    if (groups instanceof Map) return groups.get(event.id);
    return groups.find((g) => g.eventList.some((e) => e.id === event.id));
  }
  if (groups instanceof Map) return undefined;
  if (isPendingActivity(event)) {
    return groups.find((g) => g.pendingActivity?.id === event.id);
  }
  if (isPendingNexusOperation(event)) {
    return groups.find(
      (g) =>
        g?.pendingNexusOperation?.scheduledEventId === event?.scheduledEventId,
    );
  }
};
