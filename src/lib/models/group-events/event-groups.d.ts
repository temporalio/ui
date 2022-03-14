type CompactEventGroup<T = EventType, E = HistoryEventWithId, Id = E['id']> = {
  id: Id;
  name: string;
  events: Map<Id, E>;
  eventIds: Set<Id>;
  initialEvent: HistoryEventWithId;
  timestamp: HistoryEventWithId['timestamp'];
  classification: EventClassification;
};

type CompactEventGroups<
  T = EventType,
  E = HistoryEventWithId,
> = CompactEventGroup[];
