import type { EventSortOrder } from '$lib/stores/event-view';
import type { CommonHistoryEvent, WorkflowEvent } from '$lib/types/events';
import { has } from '$lib/utilities/has';

import { createEventGroup } from './create-event-group';
import type { EventGroup, EventGroups } from './event-groups';
import { getGroupId } from './get-group-id';

export { getGroupForEvent } from './get-group-for-event';

const addToExistingGroup = (group: EventGroup, event: WorkflowEvent): void => {
  if (!group) return;

  group.events.set(event.id, event);
  group.eventIds.add(event.id);

  group.timestamp = event.timestamp;
};

export const groupEvents = (
  events: CommonHistoryEvent[],
  sort: EventSortOrder = 'ascending',
): EventGroups => {
  const groups: Record<string, EventGroup> = {};

  for (const event of events) {
    const id = getGroupId(event);
    const group = createEventGroup(event);

    if (group) {
      groups[group.id] = group;
    } else {
      addToExistingGroup(groups[id], event);
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
