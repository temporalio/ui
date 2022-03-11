type CompactEventGroup<T = EventType, E = HistoryEventWithId> = {
  id: string;
  name: string;
  events: Map<T, E>;
  eventIds: Set<string>;
};

type CompactEventGroups<
  T = EventType,
  E = HistoryEventWithId,
> = CompactEventGroup[];
