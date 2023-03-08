type EventId = EventType['id'];

interface EventGroup
  extends Pick<
    WorkflowEvent,
    'timestamp' | 'classification' | 'category' | 'eventTime' | 'attributes'
  > {
  id: EventId;
  name: string;
  events: Map<EventId, WorkflowEvent>;
  eventIds: Set<EventId>;
  initialEvent: WorkflowEvent;
  lastEvent: WorkflowEvent;
  eventList: WorkflowEvent[];
  subGroups: Map<EventId, EventGroup>;
  subGroupList: EventGroup[];
  pendingActivity: PendingActivity | undefined;
  isFailureOrTimedOut: boolean;
  isCanceled: boolean;
  isTerminated: boolean;
  isCompleted: boolean;
}

type EventGroups = EventGroup[];
