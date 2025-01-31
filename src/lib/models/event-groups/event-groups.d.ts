import type { Payload } from '$lib/types';
import type {
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
} from '$lib/types/events';
import type { EventType } from '$lib/utilities/is-event-type';

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
  finalClassification: EventClassification;
  isPending: boolean;
  isFailureOrTimedOut: boolean;
  isCanceled: boolean;
  isTerminated: boolean;
  level: number | undefined;
  pendingActivity: PendingActivity | undefined;
  pendingNexusOperation: PendingNexusOperation | undefined;
  userMetadata?: { summary?: Payload };
}

type EventGroups = EventGroup[];
