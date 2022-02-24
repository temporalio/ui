type CompactEventGroup<T = EventType, E = HistoryEventWithId> = {
  id: string;
  name: string;
  events: Map<T, E>;
};

type CompactEventGroups<
  T = EventType,
  E = HistoryEventWithId,
> = CompactEventGroup[];
