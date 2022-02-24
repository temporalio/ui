import { createEventGroup } from './create-event-group';
import { getGroupId } from './get-group-id';

export const getLastEvent = ({
  events,
}: CompactEventGroup): HistoryEventWithId => {
  let latestEventKey = 0;
  let result: HistoryEventWithId;

  for (const event of events.values()) {
    const k = Number(event.id);
    if (k >= latestEventKey) {
      latestEventKey = k;
      result = event;
    }
  }

  return result;
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
      groups[id]?.events.set(event.eventType, event);
    }
  }

  return Object.values(groups);
};
