type EventId = EventType['id'];

type EventGroup = {
  id: EventId;
  name: string;
  events: Map<EventId, EventType>;
  eventIds: Set<EventId>;
  initialEvent: WorkflowEvent;
} & Pick<
  WorkflowEvent,
  'timestamp' | 'classification' | 'category' | 'eventTime' | 'attributes'
>;

type EventGroups = EventGroup[];
