type EventGroup<E = WorkflowEvent, Id = E['id']> = {
  id: Id;
  name: string;
  events: Map<Id, E>;
  eventIds: Set<Id>;
  initialEvent: WorkflowEvent;
  timestamp: WorkflowEvent['timestamp'];
  eventTime: WorkflowEvent['eventTime'];
  attributes: WorkflowEvent['attributes'];
} & Pick<WorkflowEvent, 'timestamp' | 'classification' | 'category'>;

type EventGroups<T = EventType, E = WorkflowEvent> = EventGroup<T, E>[] &
  ArrayLike;
