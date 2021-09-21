export const isWorkflowExecutionStartedEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionStartedEvent => {
  return !!event.workflowExecutionStartedEventAttributes;
};

export const isWorkflowExecutionCompletedEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionCompletedEvent => {
  return !!event.workflowExecutionCompletedEventAttributes;
};

export const isWorkflowExecutionFailedEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionFailedEvent => {
  return !!event.workflowExecutionFailedEventAttributes;
};

export const isWorkflowExecutionTimedOutEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionTimedOutEvent => {
  return !!event.workflowExecutionTimedOutEventAttributes;
};

export const isWorkflowTaskScheduledEvent = (
  event: HistoryEvent,
): event is WorkflowTaskScheduledEvent => {
  return !!event.workflowTaskScheduledEventAttributes;
};

export const isWorkflowTaskStartedEvent = (
  event: HistoryEvent,
): event is WorkflowTaskStartedEvent => {
  return !!event.workflowTaskStartedEventAttributes;
};

export const isWorkflowTaskCompletedEvent = (
  event: HistoryEvent,
): event is WorkflowTaskCompletedEvent => {
  return !!event.workflowTaskCompletedEventAttributes;
};

export const isWorkflowTaskTimedOutEvent = (
  event: HistoryEvent,
): event is WorkflowTaskTimedOutEvent => {
  return !!event.workflowTaskTimedOutEventAttributes;
};

export const isWorkflowTaskFailedEvent = (
  event: HistoryEvent,
): event is WorkflowTaskFailedEvent => {
  return !!event.workflowTaskFailedEventAttributes;
};

export const isActivityTaskScheduledEvent = (
  event: HistoryEvent,
): event is ActivityTaskScheduledEvent => {
  return !!event.activityTaskScheduledEventAttributes;
};

export const isActivityTaskStartedEvent = (
  event: HistoryEvent,
): event is ActivityTaskStartedEvent => {
  return !!event.activityTaskStartedEventAttributes;
};

export const isActivityTaskCompletedEvent = (
  event: HistoryEvent,
): event is ActivityTaskCompletedEvent => {
  return !!event.activityTaskCompletedEventAttributes;
};

export const isActivityTaskFailedEvent = (
  event: HistoryEvent,
): event is ActivityTaskFailedEvent => {
  return !!event.activityTaskFailedEventAttributes;
};

export const isActivityTaskTimedOutEvent = (
  event: HistoryEvent,
): event is ActivityTaskTimedOutEvent => {
  return !!event.activityTaskTimedOutEventAttributes;
};

export const isTimerStartedEvent = (
  event: HistoryEvent,
): event is TimerStartedEvent => {
  return !!event.timerStartedEventAttributes;
};

export const isTimerFiredEvent = (
  event: HistoryEvent,
): event is TimerFiredEvent => {
  return !!event.timerFiredEventAttributes;
};

export const isActivityTaskCancelRequestedEvent = (
  event: HistoryEvent,
): event is ActivityTaskCancelRequestedEvent => {
  return !!event.activityTaskCancelRequestedEventAttributes;
};

export const isActivityTaskCanceledEvent = (
  event: HistoryEvent,
): event is ActivityTaskCanceledEvent => {
  return !!event.activityTaskCanceledEventAttributes;
};

export const isTimerCanceledEvent = (
  event: HistoryEvent,
): event is TimerCanceledEvent => {
  return !!event.timerCanceledEventAttributes;
};

export const isMarkerRecordedEvent = (
  event: HistoryEvent,
): event is MarkerRecordedEvent => {
  return !!event.markerRecordedEventAttributes;
};

export const isWorkflowExecutionSignaledEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionSignaledEvent => {
  return !!event.workflowExecutionSignaledEventAttributes;
};

export const isWorkflowExecutionTerminatedEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionTerminatedEvent => {
  return !!event.workflowExecutionTerminatedEventAttributes;
};

export const isWorkflowExecutionCancelRequestedEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionCancelRequestedEvent => {
  return !!event.workflowExecutionCancelRequestedEventAttributes;
};

export const isWorkflowExecutionCanceledEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionCanceledEvent => {
  return !!event.workflowExecutionCanceledEventAttributes;
};

export const isRequestCancelExternalWorkflowExecutionInitiatedEvent = (
  event: HistoryEvent,
): event is RequestCancelExternalWorkflowExecutionInitiatedEvent => {
  return !!event.requestCancelExternalWorkflowExecutionInitiatedEventAttributes;
};

export const isRequestCancelExternalWorkflowExecutionFailedEvent = (
  event: HistoryEvent,
): event is RequestCancelExternalWorkflowExecutionFailedEvent => {
  return !!event.requestCancelExternalWorkflowExecutionFailedEventAttributes;
};

export const isExternalWorkflowExecutionCancelRequestedEvent = (
  event: HistoryEvent,
): event is ExternalWorkflowExecutionCancelRequestedEvent => {
  return !!event.externalWorkflowExecutionCancelRequestedEventAttributes;
};

export const isWorkflowExecutionContinuedAsNewEvent = (
  event: HistoryEvent,
): event is WorkflowExecutionContinuedAsNewEvent => {
  return !!event.workflowExecutionContinuedAsNewEventAttributes;
};

export const isStartChildWorkflowExecutionInitiatedEvent = (
  event: HistoryEvent,
): event is StartChildWorkflowExecutionInitiatedEvent => {
  return !!event.startChildWorkflowExecutionInitiatedEventAttributes;
};

export const isStartChildWorkflowExecutionFailedEvent = (
  event: HistoryEvent,
): event is StartChildWorkflowExecutionFailedEvent => {
  return !!event.startChildWorkflowExecutionFailedEventAttributes;
};

export const isChildWorkflowExecutionStartedEvent = (
  event: HistoryEvent,
): event is ChildWorkflowExecutionStartedEvent => {
  return !!event.childWorkflowExecutionStartedEventAttributes;
};

export const isChildWorkflowExecutionCompletedEvent = (
  event: HistoryEvent,
): event is ChildWorkflowExecutionCompletedEvent => {
  return !!event.childWorkflowExecutionCompletedEventAttributes;
};

export const isChildWorkflowExecutionFailedEvent = (
  event: HistoryEvent,
): event is ChildWorkflowExecutionFailedEvent => {
  return !!event.childWorkflowExecutionFailedEventAttributes;
};

export const isChildWorkflowExecutionCanceledEvent = (
  event: HistoryEvent,
): event is ChildWorkflowExecutionCanceledEvent => {
  return !!event.childWorkflowExecutionCanceledEventAttributes;
};

export const isChildWorkflowExecutionTimedOutEvent = (
  event: HistoryEvent,
): event is ChildWorkflowExecutionTimedOutEvent => {
  return !!event.childWorkflowExecutionTimedOutEventAttributes;
};

export const isChildWorkflowExecutionTerminatedEvent = (
  event: HistoryEvent,
): event is ChildWorkflowExecutionTerminatedEvent => {
  return !!event.childWorkflowExecutionTerminatedEventAttributes;
};

export const isSignalExternalWorkflowExecutionInitiatedEvent = (
  event: HistoryEvent,
): event is SignalExternalWorkflowExecutionInitiatedEvent => {
  return !!event.signalExternalWorkflowExecutionInitiatedEventAttributes;
};

export const isSignalExternalWorkflowExecutionFailedEvent = (
  event: HistoryEvent,
): event is SignalExternalWorkflowExecutionFailedEvent => {
  return !!event.signalExternalWorkflowExecutionFailedEventAttributes;
};

export const isExternalWorkflowExecutionSignaledEvent = (
  event: HistoryEvent,
): event is ExternalWorkflowExecutionSignaledEvent => {
  return !!event.externalWorkflowExecutionSignaledEventAttributes;
};

export const isUpsertWorkflowSearchAttributesEvent = (
  event: HistoryEvent,
): event is UpsertWorkflowSearchAttributesEvent => {
  return !!event.upsertWorkflowSearchAttributesEventAttributes;
};
