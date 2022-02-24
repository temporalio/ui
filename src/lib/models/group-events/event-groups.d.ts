type CompactEventGroup = {
  id: string;
  name: string;
  events: Map<EventType, HistoryEventWithId>;
};

type CompactEventGroups = CompactEventGroup[];
