type HistoryEvent = import('$types').IHistoryEvent;
type WorkflowExecutionStartedEventAttributes =
  import('$types').IWorkflowExecutionStartedEventAttributes;
type WorkflowExecutionCompletedEventAttributes =
  import('$types').IWorkflowExecutionCompletedEventAttributes;
type WorkflowExecutionFailedEventAttributes =
  import('$types').IWorkflowExecutionFailedEventAttributes;
type WorkflowExecutionTimedOutEventAttributes =
  import('$types').IWorkflowExecutionTimedOutEventAttributes;
type WorkflowTaskScheduledEventAttributes =
  import('$types').IWorkflowTaskScheduledEventAttributes;
type WorkflowTaskStartedEventAttributes =
  import('$types').IWorkflowTaskStartedEventAttributes;
type WorkflowTaskCompletedEventAttributes =
  import('$types').IWorkflowTaskCompletedEventAttributes;
type WorkflowTaskTimedOutEventAttributes =
  import('$types').IWorkflowTaskTimedOutEventAttributes;
type WorkflowTaskFailedEventAttributes =
  import('$types').IWorkflowTaskFailedEventAttributes;
type ActivityTaskScheduledEventAttributes =
  import('$types').IActivityTaskScheduledEventAttributes;
type ActivityTaskStartedEventAttributes =
  import('$types').IActivityTaskStartedEventAttributes;
type ActivityTaskCompletedEventAttributes =
  import('$types').IActivityTaskCompletedEventAttributes;
type ActivityTaskFailedEventAttributes =
  import('$types').IActivityTaskFailedEventAttributes;
type ActivityTaskTimedOutEventAttributes =
  import('$types').IActivityTaskTimedOutEventAttributes;
type TimerStartedEventAttributes =
  import('$types').ITimerStartedEventAttributes;
type TimerFiredEventAttributes = import('$types').ITimerFiredEventAttributes;
type ActivityTaskCancelRequestedEventAttributes =
  import('$types').IActivityTaskCancelRequestedEventAttributes;
type ActivityTaskCanceledEventAttributes =
  import('$types').IActivityTaskCanceledEventAttributes;
type TimerCanceledEventAttributes =
  import('$types').ITimerCanceledEventAttributes;
type MarkerRecordedEventAttributes =
  import('$types').IMarkerRecordedEventAttributes;
type WorkflowExecutionSignaledEventAttributes =
  import('$types').IWorkflowExecutionSignaledEventAttributes;
type WorkflowExecutionTerminatedEventAttributes =
  import('$types').IWorkflowExecutionTerminatedEventAttributes;
type WorkflowExecutionCancelRequestedEventAttributes =
  import('$types').IWorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionCanceledEventAttributes =
  import('$types').IWorkflowExecutionCanceledEventAttributes;
type RequestCancelExternalWorkflowExecutionInitiatedEventAttributes =
  import('$types').IRequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
type RequestCancelExternalWorkflowExecutionFailedEventAttributes =
  import('$types').IRequestCancelExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionCancelRequestedEventAttributes =
  import('$types').IExternalWorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionContinuedAsNewEventAttributes =
  import('$types').IWorkflowExecutionContinuedAsNewEventAttributes;
type StartChildWorkflowExecutionInitiatedEventAttributes =
  import('$types').IStartChildWorkflowExecutionInitiatedEventAttributes;
type StartChildWorkflowExecutionFailedEventAttributes =
  import('$types').IStartChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionStartedEventAttributes =
  import('$types').IChildWorkflowExecutionStartedEventAttributes;
type ChildWorkflowExecutionCompletedEventAttributes =
  import('$types').IChildWorkflowExecutionCompletedEventAttributes;
type ChildWorkflowExecutionFailedEventAttributes =
  import('$types').IChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionCanceledEventAttributes =
  import('$types').IChildWorkflowExecutionCanceledEventAttributes;
type ChildWorkflowExecutionTimedOutEventAttributes =
  import('$types').IChildWorkflowExecutionTimedOutEventAttributes;
type ChildWorkflowExecutionTerminatedEventAttributes =
  import('$types').IChildWorkflowExecutionTerminatedEventAttributes;
type SignalExternalWorkflowExecutionInitiatedEventAttributes =
  import('$types').ISignalExternalWorkflowExecutionInitiatedEventAttributes;
type SignalExternalWorkflowExecutionFailedEventAttributes =
  import('$types').ISignalExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionSignaledEventAttributes =
  import('$types').IExternalWorkflowExecutionSignaledEventAttributes;
type UpsertWorkflowSearchAttributesEventAttributes =
  import('$types').IUpsertWorkflowSearchAttributesEventAttributes;

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
