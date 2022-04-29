type EventId = EventType['id'];

type EventGroup = {
  id: EventId;
  name: string;
  events: Map<EventId, EventType>;
  eventIds: Set<EventId>;
  initialEvent: WorkflowEvent;
  eventTime: WorkflowEvent['eventTime'];
  attributes: WorkflowEvent['attributes'];
} & Pick<
  WorkflowEvent,
  'timestamp' | 'classification' | 'category' | 'eventTime'
>;

type EventGroups = EventGroup[];
