import { groupEvents } from '.';

export const getGroupForEvent = (
  event: HistoryEventWithId,
  groups: CompactEventGroups,
): CompactEventGroup => {
  const eventId = event.id;

  for (const group of groups) {
    if (eventId === group.id) return group;
    for (const ev of group.events.values()) {
      if (ev.id === event.id) {
        return group;
      }
    }
  }
};
