import type { WorkflowEvent } from '$lib/types/events';
import type { EventType } from '$lib/utilities/is-event-type';

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
  isFailureOrTimedOut: boolean;
  isCanceled: boolean;
  isTerminated: boolean;
}

type EventGroups = EventGroup[];
