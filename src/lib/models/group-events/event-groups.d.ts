type CompactEventGroup<T = EventType, E = HistoryEventWithId> = {
  id: string;
  name: string;
  events: Map<T, E>;
  eventIds: Set<string>;
  initialEvent: HistoryEventWithId;
  timestamp: HistoryEventWithId['timestamp'];
  classification: EventClassification;
};

type CompactEventGroups<
  T = EventType,
  E = HistoryEventWithId,
> = CompactEventGroup[];
