type HistoryEvent = import('$types').HistoryEvent;
type WorkflowExecutionStartedEventAttributes =
  import('$types').WorkflowExecutionStartedEventAttributes;
type WorkflowExecutionCompletedEventAttributes =
  import('$types').WorkflowExecutionCompletedEventAttributes;
type WorkflowExecutionFailedEventAttributes =
  import('$types').WorkflowExecutionFailedEventAttributes;
type WorkflowExecutionTimedOutEventAttributes =
  import('$types').WorkflowExecutionTimedOutEventAttributes;
type WorkflowTaskScheduledEventAttributes =
  import('$types').WorkflowTaskScheduledEventAttributes;
type WorkflowTaskStartedEventAttributes =
  import('$types').WorkflowTaskStartedEventAttributes;
type WorkflowTaskCompletedEventAttributes =
  import('$types').WorkflowTaskCompletedEventAttributes;
type WorkflowTaskTimedOutEventAttributes =
  import('$types').WorkflowTaskTimedOutEventAttributes;
type WorkflowTaskFailedEventAttributes =
  import('$types').WorkflowTaskFailedEventAttributes;
type ActivityTaskScheduledEventAttributes =
  import('$types').ActivityTaskScheduledEventAttributes;
type ActivityTaskStartedEventAttributes =
  import('$types').ActivityTaskStartedEventAttributes;
type ActivityTaskCompletedEventAttributes =
  import('$types').ActivityTaskCompletedEventAttributes;
type ActivityTaskFailedEventAttributes =
  import('$types').ActivityTaskFailedEventAttributes;
type ActivityTaskTimedOutEventAttributes =
  import('$types').ActivityTaskTimedOutEventAttributes;
type TimerStartedEventAttributes = import('$types').TimerStartedEventAttributes;
type TimerFiredEventAttributes = import('$types').TimerFiredEventAttributes;
type ActivityTaskCancelRequestedEventAttributes =
  import('$types').ActivityTaskCancelRequestedEventAttributes;
type ActivityTaskCanceledEventAttributes =
  import('$types').ActivityTaskCanceledEventAttributes;
type TimerCanceledEventAttributes =
  import('$types').TimerCanceledEventAttributes;
type MarkerRecordedEventAttributes =
  import('$types').MarkerRecordedEventAttributes;
type WorkflowExecutionSignaledEventAttributes =
  import('$types').WorkflowExecutionSignaledEventAttributes;
type WorkflowExecutionTerminatedEventAttributes =
  import('$types').WorkflowExecutionTerminatedEventAttributes;
type WorkflowExecutionCancelRequestedEventAttributes =
  import('$types').WorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionCanceledEventAttributes =
  import('$types').WorkflowExecutionCanceledEventAttributes;
type RequestCancelExternalWorkflowExecutionInitiatedEventAttributes =
  import('$types').RequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
type RequestCancelExternalWorkflowExecutionFailedEventAttributes =
  import('$types').RequestCancelExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionCancelRequestedEventAttributes =
  import('$types').ExternalWorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionContinuedAsNewEventAttributes =
  import('$types').WorkflowExecutionContinuedAsNewEventAttributes;
type StartChildWorkflowExecutionInitiatedEventAttributes =
  import('$types').StartChildWorkflowExecutionInitiatedEventAttributes;
type StartChildWorkflowExecutionFailedEventAttributes =
  import('$types').StartChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionStartedEventAttributes =
  import('$types').ChildWorkflowExecutionStartedEventAttributes;
type ChildWorkflowExecutionCompletedEventAttributes =
  import('$types').ChildWorkflowExecutionCompletedEventAttributes;
type ChildWorkflowExecutionFailedEventAttributes =
  import('$types').ChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionCanceledEventAttributes =
  import('$types').ChildWorkflowExecutionCanceledEventAttributes;
type ChildWorkflowExecutionTimedOutEventAttributes =
  import('$types').ChildWorkflowExecutionTimedOutEventAttributes;
type ChildWorkflowExecutionTerminatedEventAttributes =
  import('$types').ChildWorkflowExecutionTerminatedEventAttributes;
type SignalExternalWorkflowExecutionInitiatedEventAttributes =
  import('$types').SignalExternalWorkflowExecutionInitiatedEventAttributes;
type SignalExternalWorkflowExecutionFailedEventAttributes =
  import('$types').SignalExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionSignaledEventAttributes =
  import('$types').ExternalWorkflowExecutionSignaledEventAttributes;
type UpsertWorkflowSearchAttributesEventAttributes =
  import('$types').UpsertWorkflowSearchAttributesEventAttributes;

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
declare namespace svelte.JSX {
  interface DOMAttributes<T> {
    onclick_outside?: CompositionEventHandler<T>;
  }
}
