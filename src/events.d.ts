type HistoryEvent = import('$types').HistoryEvent;
type PendingActivityInfo = import('$types').PendingActivityInfo;

type EventType = import('$lib/utilities/is-event-type').EventType;

type ActivityType = import('$lib/utilities/is-event-type').ActivityType;
type TimerType = import('$lib/utilities/is-event-type').TimerType;
type SignalType = import('$lib/utilities/is-event-type').SignalType;
type MarkerType = import('$lib/utilities/is-event-type').MarkerType;
type ChildType = import('$lib/utilities/is-event-type').ChildType;
type EventTypeCategory = import('$lib/utilities/get-event-categorization');

interface HistoryEventWithId extends HistoryEvent {
  id: string;
  eventType: EventType;
  attributes: EventAttribute;
}

interface PendingActivity extends PendingActivityInfo {
  id: typeof PendingActivityInfo.activityId;
  state: 'Unspecified' | 'Scheduled' | 'Started' | 'CancelRequested';
  activityType: { name: string };
}

type CommonEventKey =
  | 'id'
  | 'eventType'
  | 'attributes'
  | 'eventId'
  | 'eventTime'
  | 'version'
  | 'taskId';

type CommonHistoryEvent = Pick<HistoryEventWithId, CommonEventKey>;

type EventAttributeKey = keyof Omit<HistoryEvent, CommonEventKey>;
type EventAttribute = HistoryEvent[EventAttributeKey];
type EventAttributesWithType<K = EventAttributeKey> = HistoryEvent[K] & {
  type: K;
};

type EventWithAttributes<A extends EventAttributeKey> = CommonHistoryEvent &
  Pick<HistoryEventWithId, A> & { attributes: EventAttributesWithType<A> };

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

type EventsOrActivities = (HistoryEventWithId | PendingActivity)[];
type IterableEvents = EventsOrActivities | CompactEventGroups;
