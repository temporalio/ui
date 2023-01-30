type EventHistory = Replace<
  import('$types').History,
  { events: HistoryEvent[] }
>;

type HistoryEvent = Replace<
  import('$types').HistoryEvent,
  { eventType: EventType }
>;

type GetWorkflowExecutionHistoryResponse = Replace<
  import('$types').GetWorkflowExecutionHistoryResponse,
  { history: EventHistory }
>;

type PendingActivityInfo = Replace<
  import('$types').PendingActivityInfo,
  { activityId: string }
>;

type PendingActivity = Replace<
  PendingActivityInfo,
  'activityId',
  {
    id: string;
    state: PendingActivityState;
    activityType?: { name: string };
  }
>;

type PendingActivityState =
  | 'Unspecified'
  | 'Scheduled'
  | 'Started'
  | 'CancelRequested';

type PendingChildren = import('$types').PendingChildrenInfo;

type EventRequestMetadata = {
  namespace: string;
  settings: Settings;
  accessToken: string;
};

type EventWithMetadata = {
  historyEvent: HistoryEvent;
} & EventRequestMetadata;

type EventsWithMetadata = {
  response: HistoryEvent[];
} & EventRequestMetadata;

type EventType = import('$lib/utilities/is-event-type').EventType;

type ActivityType = import('$lib/utilities/is-event-type').ActivityType;
type TimerType = import('$lib/utilities/is-event-type').TimerType;
type SignalType = import('$lib/utilities/is-event-type').SignalType;
type MarkerType = import('$lib/utilities/is-event-type').MarkerType;
type ChildType = import('$lib/utilities/is-event-type').ChildType;

type EventTypeCategory =
  import('$lib/models/event-history/get-event-categorization').EventTypeCategory;

type EventClassification =
  import('$lib/utilities/get-event-classiciation').EventClassification;

interface WorkflowEvent extends HistoryEvent {
  id: string;
  attributes: EventAttribute;
  timestamp: string;
  classification: EventClassification;
  category: EventTypeCategory;
  name: EventType;
}

type WorkflowEvents = WorkflowEvent[];

type PendingActivityWithMetadata = {
  activity: PendingActivity;
} & EventRequestMetadata;

type CommonEventKey =
  | 'id'
  | 'eventType'
  | 'attributes'
  | 'eventId'
  | 'eventTime'
  | 'version'
  | 'taskId'
  | 'timestamp'
  | 'classification'
  | 'category'
  | 'workerMayIgnore'
  | 'name';

type CommonHistoryEvent = Pick<WorkflowEvent, CommonEventKey>;

type EventAttributeKey = keyof Omit<HistoryEvent, CommonEventKey>;
type EventAttribute = HistoryEvent[EventAttributeKey];
type EventAttributesWithType<K = EventAttributeKey> = HistoryEvent[K] & {
  type: K;
};

type EventWithAttributes<A extends EventAttributeKey> = CommonHistoryEvent &
  Pick<WorkflowEvent, A> & { attributes: EventAttributesWithType<A> };

type ActivityEvent = ActivityTaskScheduledEvent &
  ActivityTaskStartedEvent &
  ActivityTaskCompletedEvent &
  ActivityTaskFailedEvent &
  ActivityTaskTimedOutEvent &
  ActivityTaskCancelRequestedEvent &
  ActivityTaskCanceledEvent;

type TimerEvent = TimerCanceledEvent & TimerStartedEvent & TimerFiredEvent;

type SignalEvent = SignalExternalWorkflowExecutionInitiatedEvent &
  SignalExternalWorkflowExecutionFailedEvent &
  WorkflowExecutionSignaledEvent;

type MarkerEvent = MarkerRecordedEvent;

type ChildEvent = StartChildWorkflowExecutionInitiatedEvent &
  StartChildWorkflowExecutionFailedEvent &
  ChildWorkflowExecutionStartedEvent &
  ChildWorkflowExecutionCompletedEvent &
  ChildWorkflowExecutionFailedEvent &
  ChildWorkflowExecutionCanceledEvent &
  ChildWorkflowExecutionTimedOutEvent &
  ChildWorkflowExecutionTerminatedEvent;

type EventView = 'feed' | 'compact' | 'json';

type FetchEventsResponse = {
  events: WorkflowEvents;
  eventGroups: EventGroups;
};

type IterableEvent = WorkflowEvent | EventGroup;
type IterableEvents = IterableEvent[];

type WorkflowExecutionStartedEvent =
  EventWithAttributes<'workflowExecutionStartedEventAttributes'>;
type WorkflowExecutionCompletedEvent =
  EventWithAttributes<'workflowExecutionCompletedEventAttributes'>;
type WorkflowExecutionFailedEvent =
  EventWithAttributes<'workflowExecutionFailedEventAttributes'>;
type WorkflowExecutionTimedOutEvent =
  EventWithAttributes<'workflowExecutionTimedOutEventAttributes'>;
type WorkflowTaskScheduledEvent =
  EventWithAttributes<'workflowTaskScheduledEventAttributes'>;
type WorkflowTaskStartedEvent =
  EventWithAttributes<'workflowTaskStartedEventAttributes'>;
type WorkflowTaskCompletedEvent =
  EventWithAttributes<'workflowTaskCompletedEventAttributes'>;
type WorkflowTaskTimedOutEvent =
  EventWithAttributes<'workflowTaskTimedOutEventAttributes'>;
type WorkflowTaskFailedEvent =
  EventWithAttributes<'workflowTaskFailedEventAttributes'>;
type ActivityTaskScheduledEvent =
  EventWithAttributes<'activityTaskScheduledEventAttributes'>;
type ActivityTaskStartedEvent =
  EventWithAttributes<'activityTaskStartedEventAttributes'>;
type ActivityTaskCompletedEvent =
  EventWithAttributes<'activityTaskCompletedEventAttributes'>;
type ActivityTaskFailedEvent =
  EventWithAttributes<'activityTaskFailedEventAttributes'>;
type ActivityTaskTimedOutEvent =
  EventWithAttributes<'activityTaskTimedOutEventAttributes'>;
type TimerStartedEvent = EventWithAttributes<'timerStartedEventAttributes'>;
type TimerFiredEvent = EventWithAttributes<'timerFiredEventAttributes'>;
type ActivityTaskCancelRequestedEvent =
  EventWithAttributes<'activityTaskCancelRequestedEventAttributes'>;
type ActivityTaskCanceledEvent =
  EventWithAttributes<'activityTaskCanceledEventAttributes'>;
type TimerCanceledEvent = EventWithAttributes<'timerCanceledEventAttributes'>;
type MarkerRecordedEvent = EventWithAttributes<'markerRecordedEventAttributes'>;
type WorkflowExecutionSignaledEvent =
  EventWithAttributes<'workflowExecutionSignaledEventAttributes'>;
type WorkflowExecutionTerminatedEvent =
  EventWithAttributes<'workflowExecutionTerminatedEventAttributes'>;
type WorkflowExecutionCancelRequestedEvent =
  EventWithAttributes<'workflowExecutionCancelRequestedEventAttributes'>;
type WorkflowExecutionCanceledEvent =
  EventWithAttributes<'workflowExecutionCanceledEventAttributes'>;
type RequestCancelExternalWorkflowExecutionInitiatedEvent =
  EventWithAttributes<'requestCancelExternalWorkflowExecutionInitiatedEventAttributes'>;
type RequestCancelExternalWorkflowExecutionFailedEvent =
  EventWithAttributes<'requestCancelExternalWorkflowExecutionFailedEventAttributes'>;
type ExternalWorkflowExecutionCancelRequestedEvent =
  EventWithAttributes<'externalWorkflowExecutionCancelRequestedEventAttributes'>;
type WorkflowExecutionContinuedAsNewEvent =
  EventWithAttributes<'workflowExecutionContinuedAsNewEventAttributes'>;
type StartChildWorkflowExecutionInitiatedEvent =
  EventWithAttributes<'startChildWorkflowExecutionInitiatedEventAttributes'>;
type StartChildWorkflowExecutionFailedEvent =
  EventWithAttributes<'startChildWorkflowExecutionFailedEventAttributes'>;
type ChildWorkflowExecutionStartedEvent =
  EventWithAttributes<'childWorkflowExecutionStartedEventAttributes'>;
type ChildWorkflowExecutionCompletedEvent =
  EventWithAttributes<'childWorkflowExecutionCompletedEventAttributes'>;
type ChildWorkflowExecutionFailedEvent =
  EventWithAttributes<'childWorkflowExecutionFailedEventAttributes'>;
type ChildWorkflowExecutionCanceledEvent =
  EventWithAttributes<'childWorkflowExecutionCanceledEventAttributes'>;
type ChildWorkflowExecutionTimedOutEvent =
  EventWithAttributes<'childWorkflowExecutionTimedOutEventAttributes'>;
type ChildWorkflowExecutionTerminatedEvent =
  EventWithAttributes<'childWorkflowExecutionTerminatedEventAttributes'>;
type SignalExternalWorkflowExecutionInitiatedEvent =
  EventWithAttributes<'signalExternalWorkflowExecutionInitiatedEventAttributes'>;
type SignalExternalWorkflowExecutionFailedEvent =
  EventWithAttributes<'signalExternalWorkflowExecutionFailedEventAttributes'>;
type ExternalWorkflowExecutionSignaledEvent =
  EventWithAttributes<'externalWorkflowExecutionSignaledEventAttributes'>;
type UpsertWorkflowSearchAttributesEvent =
  EventWithAttributes<'upsertWorkflowSearchAttributesEventAttributes'>;

type FailActivityTaskRequest =
  import('$types').IRespondActivityTaskFailedByIdRequest;
type FailActivityTaskResponse =
  import('$types').IRespondActivityTaskFailedByIdResponse;
type CompleteActivityTaskRequest =
  import('$types').IRespondActivityTaskCompletedByIdRequest;
type CompleteActivityTaskResponse =
  import('$types').IRespondActivityTaskCompletedByIdResponse;
