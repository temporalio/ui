import { createEventGroup } from './create-event-group';
import { getGroupId } from './get-group-id';

export { getGroupForEvent } from './get-group-for-event';

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
      groups[id]?.eventIds.add(event.id);
    }
  }

  return Object.values(groups);
};
