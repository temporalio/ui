export const getGroupForEvent = (
  event: HistoryEventWithId,
  groups: CompactEventGroups,
): CompactEventGroup => {
  const eventId = event.id;

  for (const group of groups) {
    if (eventId === group.id) return group;
    for (const id of group.eventIds) {
      if (eventId === id) {
        return group;
      }
    }
  }
};
