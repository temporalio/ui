export const getFirstId = (
  eventsOrEventGroups: HistoryEventWithId[] | CompactEventGroups,
): string => {
  const [first] = eventsOrEventGroups;
  return first?.id;
};
