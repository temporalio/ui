import { createEventGroup } from './create-event-group';
import { getGroupId } from './get-group-id';

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
