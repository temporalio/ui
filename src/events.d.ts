type HistoryEvent = import('$types').HistoryEvent;
type PendingActivityInfo = import('$types').PendingActivityInfo;

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

type EventType =
  | ActivityType
  | TimerType
  | SignalType
  | MarkerType
  | ChildType
  | 'ChildWorkflowExecutionCanceled'
  | 'ChildWorkflowExecutionFailed'
  | 'ChildWorkflowExecutionTerminated'
  | 'ChildWorkflowExecutionTimedOut'
  | 'StartChildWorkflowExecutionFailed'
  | 'SignalExternalWorkflowExecutionFailed'
  | 'SignalExternalWorkflowExecutionInitiated'
  | 'WorkflowExecutionCanceled'
  | 'WorkflowExecutionCancelRequested'
  | 'WorkflowExecutionCompleted'
  | 'WorkflowExecutionContinuedAsNew'
  | 'WorkflowExecutionFailed'
  | 'WorkflowExecutionStarted'
  | 'WorkflowExecutionTerminated'
  | 'WorkflowExecutionTimedOut'
  | 'WorkflowTaskCompleted'
  | 'WorkflowTaskFailed'
  | 'WorkflowTaskScheduled'
  | 'WorkflowTaskStarted'
  | 'WorkflowTaskTimedOut'
  | 'ExternalWorkflowExecutionCancelRequested'
  | 'RequestCancelExternalWorkflowExecutionFailed'
  | 'RequestCancelExternalWorkflowExecutionInitiated'
  | 'UpsertWorkflowSearchAttributes';

type ActivityType =
  | 'ActivityTaskCanceled'
  | 'ActivityTaskCancelRequested'
  | 'ActivityTaskCompleted'
  | 'ActivityTaskFailed'
  | 'ActivityTaskScheduled'
  | 'ActivityTaskStarted'
  | 'ActivityTaskTimedOut';

type TimerType = 'TimerCanceled' | 'TimerFired' | 'TimerStarted';

type SignalType =
  | 'WorkflowExecutionSignaled'
  | 'ExternalWorkflowExecutionSignaled';

type MarkerType = 'MarkerRecorded';

type ChildType =
  | 'StartChildWorkflowExecutionInitiated'
  | 'ChildWorkflowExecutionStarted'
  | 'ChildWorkflowExecutionCompleted';

type EventTypeCategory =
  | 'activity'
  | 'child-workflow'
  | 'signal'
  | 'timer'
  | 'workflow'
  | 'command';

type EventsOrActivities = (HistoryEventWithId | PendingActivity)[];
type IterableEvents = EventsOrActivities | CompactEventGroups;
