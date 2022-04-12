import { has } from '$lib/utilities/has';
import { createEventGroup } from './create-event-group';
import { getGroupId } from './get-group-id';

export { getGroupForEvent } from './get-group-for-event';

const addToExistingGroup = (
  group: CompactEventGroup,
  event: HistoryEventWithId,
): void => {
  if (!group) return;

  group.events.set(event.id, event);
  group.eventIds.add(event.id);

  group.timestamp = event.timestamp;
};

export const groupEvents = (
  events: CommonHistoryEvent[],
): CompactEventGroups => {
  const groups: Record<string, CompactEventGroup> = {};

  for (const event of events) {
    const id = getGroupId(event);
    const group = createEventGroup(event);

    if (group) {
      groups[group.id] = group;
    } else {
      addToExistingGroup(groups[id], event);
    }
  }

  return Object.values(groups);
};

export const isEventGroup = (
  eventOrGroup: unknown,
): eventOrGroup is CompactEventGroup => {
  if (eventOrGroup === undefined || eventOrGroup === null) return false;
  return has(eventOrGroup, 'events');
};

export const isEventGroups = (
  eventsOrGroups: unknown[],
): eventsOrGroups is CompactEventGroups => {
  if (eventsOrGroups === undefined || eventsOrGroups === null) return false;
  return eventsOrGroups.every(isEventGroup);
};
