import type { EventSortOrder } from '$lib/stores/event-view';
import type {
  CommonHistoryEvent,
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
} from '$lib/types/events';
import { has } from '$lib/utilities/has';
import {
  isNexusOperationCanceledEvent,
  isNexusOperationCompletedEvent,
  isNexusOperationFailedEvent,
} from '$lib/utilities/is-event-type';
import {
  getPendingActivity,
  getPendingNexusOperation,
} from '$lib/utilities/pending-activities';

import {
  createEventGroup,
  createWorkflowTaskGroup,
} from './create-event-group';
import type { EventGroup, EventGroups } from './event-groups';
import { getGroupId } from './get-group-id';

export { getGroupForEvent } from './get-group-for-event';

const addToExistingGroup = (
  group: EventGroup,
  event: WorkflowEvent,
  pendingActivity: PendingActivity | undefined = undefined,
  pendingNexusOperation: PendingNexusOperation | undefined = undefined,
): void => {
  if (!group) return;

  group.events.set(event.id, event);
  group.eventIds.add(event.id);

  group.timestamp = event.timestamp;

  if (pendingActivity) {
    group.pendingActivity = pendingActivity;
  }

  if (group.pendingActivity && group.eventList.length === 3) {
    delete group.pendingActivity;
  }

  if (pendingNexusOperation) {
    group.pendingNexusOperation = pendingNexusOperation;
  }

  const completedNexusEvent =
    isNexusOperationCompletedEvent(event) ||
    isNexusOperationFailedEvent(event) ||
    isNexusOperationCanceledEvent(event);
  if (group.pendingNexusOperation && completedNexusEvent) {
    delete group.pendingNexusOperation;
  }
};

export const groupEvents = (
  events: CommonHistoryEvent[],
  sort: EventSortOrder = 'ascending',
  pendingActivities: PendingActivity[] = [],
  pendingNexusOperations: PendingNexusOperation[] = [],
): EventGroups => {
  const groups: Record<string, EventGroup> = {};

  const createGroups = (event: CommonHistoryEvent) => {
    const id = getGroupId(event);
    const group = createEventGroup(event);
    const pendingActivity = getPendingActivity(event, pendingActivities);
    const pendingNexusOperation = getPendingNexusOperation(
      event,
      pendingNexusOperations,
    );

    if (group) {
      groups[group.id] = group;
      if (pendingActivity) {
        group.pendingActivity = pendingActivity;
      }
      if (pendingNexusOperation) {
        group.pendingNexusOperation = pendingNexusOperation;
      }
    } else {
      addToExistingGroup(
        groups[id],
        event,
        pendingActivity,
        pendingNexusOperation,
      );
    }
  };

  if (sort === 'ascending') {
    for (const event of events) {
      createGroups(event);
    }
  } else {
    for (let i = events.length - 1; i >= 0; i--) {
      createGroups(events[i]);
    }
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
    const id = getGroupId(event);
    const group = createWorkflowTaskGroup(event);

    if (group) {
      groups[group.id] = group;
    } else {
      addToExistingGroup(groups[id], event);
    }
  };

  if (sort === 'ascending') {
    for (const event of events) {
      createGroups(event);
    }
  } else {
    for (let i = events.length - 1; i >= 0; i--) {
      createGroups(events[i]);
    }
  }

  return sort === 'descending'
    ? Object.values(groups).reverse()
    : Object.values(groups);
};
