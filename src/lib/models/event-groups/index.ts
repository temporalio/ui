import type { EventSortOrder } from '$lib/stores/event-view';
import type {
  CommonHistoryEvent,
  PendingActivity,
  WorkflowEvent,
} from '$lib/types/events';
import { has } from '$lib/utilities/has';
import { getPendingActivity } from '$lib/utilities/pending-activities';

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
};

export const groupEvents = (
  events: CommonHistoryEvent[],
  sort: EventSortOrder = 'ascending',
  pendingActivities: PendingActivity[] = [],
): EventGroups => {
  const groups: Record<string, EventGroup> = {};

  const createGroups = (event: CommonHistoryEvent) => {
    const id = getGroupId(event);
    const group = createEventGroup(event, events);
    const pendingActivity = getPendingActivity(event, pendingActivities);

    if (group) {
      groups[group.id] = group;
      if (pendingActivity) {
        group.pendingActivity = pendingActivity;
      }
    } else {
      addToExistingGroup(groups[id], event, pendingActivity);
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
    const group = createWorkflowTaskGroup(event, events);

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
