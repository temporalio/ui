type HistoryEvent =
  import('$types/temporal/api/history/v1/message').HistoryEvent;
type WorkflowExecutionStartedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionStartedEventAttributes;
type WorkflowExecutionCompletedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionCompletedEventAttributes;
type WorkflowExecutionFailedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionFailedEventAttributes;
type WorkflowExecutionTimedOutEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionTimedOutEventAttributes;
type WorkflowTaskScheduledEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowTaskScheduledEventAttributes;
type WorkflowTaskStartedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowTaskStartedEventAttributes;
type WorkflowTaskCompletedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowTaskCompletedEventAttributes;
type WorkflowTaskTimedOutEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowTaskTimedOutEventAttributes;
type WorkflowTaskFailedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowTaskFailedEventAttributes;
type ActivityTaskScheduledEventAttributes =
  import('$types/temporal/api/history/v1/message').ActivityTaskScheduledEventAttributes;
type ActivityTaskStartedEventAttributes =
  import('$types/temporal/api/history/v1/message').ActivityTaskStartedEventAttributes;
type ActivityTaskCompletedEventAttributes =
  import('$types/temporal/api/history/v1/message').ActivityTaskCompletedEventAttributes;
type ActivityTaskFailedEventAttributes =
  import('$types/temporal/api/history/v1/message').ActivityTaskFailedEventAttributes;
type ActivityTaskTimedOutEventAttributes =
  import('$types/temporal/api/history/v1/message').ActivityTaskTimedOutEventAttributes;
type TimerStartedEventAttributes =
  import('$types/temporal/api/history/v1/message').TimerStartedEventAttributes;
type TimerFiredEventAttributes =
  import('$types/temporal/api/history/v1/message').TimerFiredEventAttributes;
type ActivityTaskCancelRequestedEventAttributes =
  import('$types/temporal/api/history/v1/message').ActivityTaskCancelRequestedEventAttributes;
type ActivityTaskCanceledEventAttributes =
  import('$types/temporal/api/history/v1/message').ActivityTaskCanceledEventAttributes;
type TimerCanceledEventAttributes =
  import('$types/temporal/api/history/v1/message').TimerCanceledEventAttributes;
type MarkerRecordedEventAttributes =
  import('$types/temporal/api/history/v1/message').MarkerRecordedEventAttributes;
type WorkflowExecutionSignaledEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionSignaledEventAttributes;
type WorkflowExecutionTerminatedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionTerminatedEventAttributes;
type WorkflowExecutionCancelRequestedEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionCanceledEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionCanceledEventAttributes;
type RequestCancelExternalWorkflowExecutionInitiatedEventAttributes =
  import('$types/temporal/api/history/v1/message').RequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
type RequestCancelExternalWorkflowExecutionFailedEventAttributes =
  import('$types/temporal/api/history/v1/message').RequestCancelExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionCancelRequestedEventAttributes =
  import('$types/temporal/api/history/v1/message').ExternalWorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionContinuedAsNewEventAttributes =
  import('$types/temporal/api/history/v1/message').WorkflowExecutionContinuedAsNewEventAttributes;
type StartChildWorkflowExecutionInitiatedEventAttributes =
  import('$types/temporal/api/history/v1/message').StartChildWorkflowExecutionInitiatedEventAttributes;
type StartChildWorkflowExecutionFailedEventAttributes =
  import('$types/temporal/api/history/v1/message').StartChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionStartedEventAttributes =
  import('$types/temporal/api/history/v1/message').ChildWorkflowExecutionStartedEventAttributes;
type ChildWorkflowExecutionCompletedEventAttributes =
  import('$types/temporal/api/history/v1/message').ChildWorkflowExecutionCompletedEventAttributes;
type ChildWorkflowExecutionFailedEventAttributes =
  import('$types/temporal/api/history/v1/message').ChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionCanceledEventAttributes =
  import('$types/temporal/api/history/v1/message').ChildWorkflowExecutionCanceledEventAttributes;
type ChildWorkflowExecutionTimedOutEventAttributes =
  import('$types/temporal/api/history/v1/message').ChildWorkflowExecutionTimedOutEventAttributes;
type ChildWorkflowExecutionTerminatedEventAttributes =
  import('$types/temporal/api/history/v1/message').ChildWorkflowExecutionTerminatedEventAttributes;
type SignalExternalWorkflowExecutionInitiatedEventAttributes =
  import('$types/temporal/api/history/v1/message').SignalExternalWorkflowExecutionInitiatedEventAttributes;
type SignalExternalWorkflowExecutionFailedEventAttributes =
  import('$types/temporal/api/history/v1/message').SignalExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionSignaledEventAttributes =
  import('$types/temporal/api/history/v1/message').ExternalWorkflowExecutionSignaledEventAttributes;
type UpsertWorkflowSearchAttributesEventAttributes =
  import('$types/temporal/api/history/v1/message').UpsertWorkflowSearchAttributesEventAttributes;

type BaseEvent = Pick<
  HistoryEvent,
  'eventId' | 'eventTime' | 'eventType' | 'version' | 'taskId'
>;

type WorkflowExecutionStartedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionStartedEventAttributes'>;
type WorkflowExecutionCompletedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionCompletedEventAttributes'>;
type WorkflowExecutionFailedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionFailedEventAttributes'>;
type WorkflowExecutionTimedOutEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionTimedOutEventAttributes'>;
type WorkflowTaskScheduledEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowTaskScheduledEventAttributes'>;
type WorkflowTaskStartedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowTaskStartedEventAttributes'>;
type WorkflowTaskCompletedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowTaskCompletedEventAttributes'>;
type WorkflowTaskTimedOutEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowTaskTimedOutEventAttributes'>;
type WorkflowTaskFailedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowTaskFailedEventAttributes'>;
type ActivityTaskScheduledEvent = BaseEvent &
  Pick<HistoryEvent, 'activityTaskScheduledEventAttributes'>;
type ActivityTaskStartedEvent = BaseEvent &
  Pick<HistoryEvent, 'activityTaskStartedEventAttributes'>;
type ActivityTaskCompletedEvent = BaseEvent &
  Pick<HistoryEvent, 'activityTaskCompletedEventAttributes'>;
type ActivityTaskFailedEvent = BaseEvent &
  Pick<HistoryEvent, 'activityTaskFailedEventAttributes'>;
type ActivityTaskTimedOutEvent = BaseEvent &
  Pick<HistoryEvent, 'activityTaskTimedOutEventAttributes'>;
type TimerStartedEvent = BaseEvent &
  Pick<HistoryEvent, 'timerStartedEventAttributes'>;
type TimerFiredEvent = BaseEvent &
  Pick<HistoryEvent, 'timerFiredEventAttributes'>;
type ActivityTaskCancelRequestedEvent = BaseEvent &
  Pick<HistoryEvent, 'activityTaskCancelRequestedEventAttributes'>;
type ActivityTaskCanceledEvent = BaseEvent &
  Pick<HistoryEvent, 'activityTaskCanceledEventAttributes'>;
type TimerCanceledEvent = BaseEvent &
  Pick<HistoryEvent, 'timerCanceledEventAttributes'>;
type MarkerRecordedEvent = BaseEvent &
  Pick<HistoryEvent, 'markerRecordedEventAttributes'>;
type WorkflowExecutionSignaledEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionSignaledEventAttributes'>;
type WorkflowExecutionTerminatedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionTerminatedEventAttributes'>;
type WorkflowExecutionCancelRequestedEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionCancelRequestedEventAttributes'>;
type WorkflowExecutionCanceledEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionCanceledEventAttributes'>;
type RequestCancelExternalWorkflowExecutionInitiatedEvent = BaseEvent &
  Pick<
    HistoryEvent,
    'requestCancelExternalWorkflowExecutionInitiatedEventAttributes'
  >;
type RequestCancelExternalWorkflowExecutionFailedEvent = BaseEvent &
  Pick<
    HistoryEvent,
    'requestCancelExternalWorkflowExecutionFailedEventAttributes'
  >;
type ExternalWorkflowExecutionCancelRequestedEvent = BaseEvent &
  Pick<HistoryEvent, 'externalWorkflowExecutionCancelRequestedEventAttributes'>;
type WorkflowExecutionContinuedAsNewEvent = BaseEvent &
  Pick<HistoryEvent, 'workflowExecutionContinuedAsNewEventAttributes'>;
type StartChildWorkflowExecutionInitiatedEvent = BaseEvent &
  Pick<HistoryEvent, 'startChildWorkflowExecutionInitiatedEventAttributes'>;
type StartChildWorkflowExecutionFailedEvent = BaseEvent &
  Pick<HistoryEvent, 'startChildWorkflowExecutionFailedEventAttributes'>;
type ChildWorkflowExecutionStartedEvent = BaseEvent &
  Pick<HistoryEvent, 'childWorkflowExecutionStartedEventAttributes'>;
type ChildWorkflowExecutionCompletedEvent = BaseEvent &
  Pick<HistoryEvent, 'childWorkflowExecutionCompletedEventAttributes'>;
type ChildWorkflowExecutionFailedEvent = BaseEvent &
  Pick<HistoryEvent, 'childWorkflowExecutionFailedEventAttributes'>;
type ChildWorkflowExecutionCanceledEvent = BaseEvent &
  Pick<HistoryEvent, 'childWorkflowExecutionCanceledEventAttributes'>;
type ChildWorkflowExecutionTimedOutEvent = BaseEvent &
  Pick<HistoryEvent, 'childWorkflowExecutionTimedOutEventAttributes'>;
type ChildWorkflowExecutionTerminatedEvent = BaseEvent &
  Pick<HistoryEvent, 'childWorkflowExecutionTerminatedEventAttributes'>;
type SignalExternalWorkflowExecutionInitiatedEvent = BaseEvent &
  Pick<HistoryEvent, 'signalExternalWorkflowExecutionInitiatedEventAttributes'>;
type SignalExternalWorkflowExecutionFailedEvent = BaseEvent &
  Pick<HistoryEvent, 'signalExternalWorkflowExecutionFailedEventAttributes'>;
type ExternalWorkflowExecutionSignaledEvent = BaseEvent &
  Pick<HistoryEvent, 'externalWorkflowExecutionSignaledEventAttributes'>;
type UpsertWorkflowSearchAttributesEvent = BaseEvent &
  Pick<HistoryEvent, 'upsertWorkflowSearchAttributesEventAttributes'>;
