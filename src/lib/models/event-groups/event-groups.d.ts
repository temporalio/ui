import type { WorkflowEvent } from '$lib/types/events';
import type { EventType } from '$lib/utilities/is-event-type';

import type { EventClassification } from '../event-history/get-event-classification';

type EventId = EventType['id'];

interface EventGroup
  extends Pick<
    WorkflowEvent,
    'timestamp' | 'classification' | 'category' | 'eventTime' | 'attributes'
  > {
  id: EventId;
  name: string;
  label: string;
  displayName: string;
  events: Map<EventId, WorkflowEvent>;
  eventIds: Set<EventId>;
  initialEvent: WorkflowEvent;
  lastEvent: WorkflowEvent;
  eventList: WorkflowEvent[];
  isFailureOrTimedOut: boolean;
  isFailure: boolean;
  isTimedOut: boolean;
  isCanceled: boolean;
  isTerminated: boolean;
  isCompleted: boolean;
  status: EventClassification;
}

type EventGroups = EventGroup[];
