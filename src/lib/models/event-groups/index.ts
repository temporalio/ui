import type { EventSortOrder } from '$lib/stores/event-view';
import type {
  CommonHistoryEvent,
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
} from '$lib/types/events';
import { has } from '$lib/utilities/has';
import {
  isActivityTaskScheduledEvent,
  isNexusOperationCanceledEvent,
  isNexusOperationCompletedEvent,
  isNexusOperationFailedEvent,
  isNexusOperationScheduledEvent,
  isNexusOperationTimedOutEvent,
} from '$lib/utilities/is-event-type';

import {
  createEventGroup,
  createWorkflowTaskGroup,
} from './create-event-group';
import type { EventGroup, EventGroups } from './event-groups';
import { getGroupId } from './get-group-id';

export { getGroupForEvent } from './get-group-for-event';

// Build O(1) lookup maps from pending arrays so the hot loop in groupEvents
// does a single Map.get per event instead of Array.find (O(M) per event).
function buildPendingMaps(
  pendingActivities: PendingActivity[],
  pendingNexusOperations: PendingNexusOperation[],
) {
  return {
    byActivityId: new Map(pendingActivities.map((p) => [p.activityId, p])),
    byNexusScheduledId: new Map(
      pendingNexusOperations.map((p) => [String(p.scheduledEventId), p]),
    ),
  };
}

function resolveEvent(
  event: CommonHistoryEvent,
  groups: Record<string, EventGroup>,
  byActivityId: Map<string, PendingActivity>,
  byNexusScheduledId: Map<string, PendingNexusOperation>,
  dropped: CommonHistoryEvent[] | null,
) {
  const id = getGroupId(event);
  const group = createEventGroup(event);

  const pa = isActivityTaskScheduledEvent(event)
    ? byActivityId.get(event.activityTaskScheduledEventAttributes.activityId)
    : undefined;
  const pn = isNexusOperationScheduledEvent(event)
    ? byNexusScheduledId.get(event.id)
    : undefined;

  if (group) {
    groups[group.id] = group;
    if (pa) group.pendingActivity = pa;
    if (pn) group.pendingNexusOperation = pn;

    // Retry events that arrived before this group was created (bookend edge case
    // where a completion event from the descending cursor lands before its
    // scheduling event has been processed).
    if (dropped) {
      for (let i = dropped.length - 1; i >= 0; i--) {
        if (getGroupId(dropped[i]) === group.id) {
          addToExistingGroup(dropped[i] as WorkflowEvent, groups);
          dropped.splice(i, 1);
        }
      }
    }
  } else if (groups[id]) {
    addToExistingGroup(event as WorkflowEvent, groups, pa, pn);
  } else if (dropped) {
    dropped.push(event);
  }
}

// Thin wrapper that matches the existing addToExistingGroup signature but pulls
// the group from the map — avoids a separate lookup at each call site.
function addToExistingGroup(
  event: WorkflowEvent,
  groups: Record<string, EventGroup>,
  pa?: PendingActivity,
  pn?: PendingNexusOperation,
) {
  const id = getGroupId(event as CommonHistoryEvent);
  const group = groups[id];
  if (!group) return;

  group.events.set(event.id, event);
  group.eventIds.add(event.id);
  group.timestamp = event.timestamp;

  if (pa) group.pendingActivity = pa;
  if (group.pendingActivity && group.eventList.length === 3)
    delete group.pendingActivity;

  if (pn) group.pendingNexusOperation = pn;

  const completedNexus =
    isNexusOperationCompletedEvent(event) ||
    isNexusOperationFailedEvent(event) ||
    isNexusOperationCanceledEvent(event) ||
    isNexusOperationTimedOutEvent(event);
  if (group.pendingNexusOperation && completedNexus)
    delete group.pendingNexusOperation;
}

export const groupEvents = (
  events: CommonHistoryEvent[],
  sort: EventSortOrder = 'ascending',
  pendingActivities: PendingActivity[] = [],
  pendingNexusOperations: PendingNexusOperation[] = [],
): EventGroups => {
  const groups: Record<string, EventGroup> = {};
  const { byActivityId, byNexusScheduledId } = buildPendingMaps(
    pendingActivities,
    pendingNexusOperations,
  );

  if (sort === 'ascending') {
    for (const event of events)
      resolveEvent(event, groups, byActivityId, byNexusScheduledId, null);
  } else {
    for (let i = events.length - 1; i >= 0; i--)
      resolveEvent(events[i], groups, byActivityId, byNexusScheduledId, null);
  }

  return sort === 'descending'
    ? Object.values(groups).reverse()
    : Object.values(groups);
};

export const isEventGroup = (
  eventOrGroup: unknown,
): eventOrGroup is EventGroup => {
  if (eventOrGroup === undefined || eventOrGroup === null) return false;
  return has(eventOrGroup, 'events');
};

export const isEventGroups = (
  eventsOrGroups: unknown[],
): eventsOrGroups is EventGroups => {
  if (eventsOrGroups === undefined || eventsOrGroups === null) return false;
  return eventsOrGroups.every(isEventGroup);
};

export const groupWorkflowTaskEvents = (
  events: CommonHistoryEvent[],
  sort: EventSortOrder = 'ascending',
): EventGroups => {
  const groups: Record<string, EventGroup> = {};

  const createGroups = (event: CommonHistoryEvent) => {
    const group = createWorkflowTaskGroup(event);
    if (group) {
      groups[group.id] = group;
    } else {
      addToExistingGroup(event as WorkflowEvent, groups);
    }
  };

  if (sort === 'ascending') {
    for (const event of events) createGroups(event);
  } else {
    for (let i = events.length - 1; i >= 0; i--) createGroups(events[i]);
  }

  return sort === 'descending'
    ? Object.values(groups).reverse()
    : Object.values(groups);
};
