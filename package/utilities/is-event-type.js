export const activityEvents = [
    'ActivityTaskCanceled',
    'ActivityTaskCancelRequested',
    'ActivityTaskCompleted',
    'ActivityTaskFailed',
    'ActivityTaskScheduled',
    'ActivityTaskStarted',
    'ActivityTaskTimedOut',
];
export const timerEvents = [
    'TimerStarted',
    'TimerCanceled',
    'TimerFired',
];
export const signalEvents = [
    'WorkflowExecutionSignaled',
    'SignalExternalWorkflowExecutionFailed',
    'SignalExternalWorkflowExecutionInitiated',
];
export const markerEvents = ['MarkerRecorded'];
const childEvents = [
    'StartChildWorkflowExecutionInitiated',
    'ChildWorkflowExecutionStarted',
    'ChildWorkflowExecutionCompleted',
    'ChildWorkflowExecutionCanceled',
    'ChildWorkflowExecutionFailed',
    'ChildWorkflowExecutionTerminated',
    'ChildWorkflowExecutionTimedOut',
    'StartChildWorkflowExecutionFailed',
];
export const eventTypes = [
    ...activityEvents,
    ...timerEvents,
    ...signalEvents,
    ...markerEvents,
    ...childEvents,
    'WorkflowExecutionCanceled',
    'WorkflowExecutionCancelRequested',
    'WorkflowExecutionCompleted',
    'WorkflowExecutionContinuedAsNew',
    'WorkflowExecutionFailed',
    'WorkflowExecutionStarted',
    'WorkflowExecutionTerminated',
    'WorkflowExecutionTimedOut',
    'WorkflowTaskCompleted',
    'WorkflowTaskFailed',
    'WorkflowTaskScheduled',
    'WorkflowTaskStarted',
    'WorkflowTaskTimedOut',
    'ExternalWorkflowExecutionCancelRequested',
    'ExternalWorkflowExecutionSignaled',
    'RequestCancelExternalWorkflowExecutionFailed',
    'RequestCancelExternalWorkflowExecutionInitiated',
    'UpsertWorkflowSearchAttributes',
];
export const eventAttributeKeys = [
    'workflowExecutionStartedEventAttributes',
    'workflowExecutionCompletedEventAttributes',
    'workflowExecutionFailedEventAttributes',
    'workflowExecutionTimedOutEventAttributes',
    'workflowTaskStartedEventAttributes',
    'workflowTaskScheduledEventAttributes',
    'workflowTaskCompletedEventAttributes',
    'workflowTaskTimedOutEventAttributes',
    'workflowTaskFailedEventAttributes',
    'activityTaskScheduledEventAttributes',
    'activityTaskCompletedEventAttributes',
    'activityTaskStartedEventAttributes',
    'activityTaskFailedEventAttributes',
    'activityTaskTimedOutEventAttributes',
    'timerStartedEventAttributes',
    'timerFiredEventAttributes',
    'activityTaskCancelRequestedEventAttributes',
    'activityTaskCanceledEventAttributes',
    'timerCanceledEventAttributes',
    'markerRecordedEventAttributes',
    'workflowExecutionSignaledEventAttributes',
    'workflowExecutionTerminatedEventAttributes',
    'workflowExecutionCancelRequestedEventAttributes',
    'workflowExecutionCanceledEventAttributes',
    'requestCancelExternalWorkflowExecutionInitiatedEventAttributes',
    'requestCancelExternalWorkflowExecutionFailedEventAttributes',
    'externalWorkflowExecutionCancelRequestedEventAttributes',
    'workflowExecutionContinuedAsNewEventAttributes',
    'startChildWorkflowExecutionInitiatedEventAttributes',
    'startChildWorkflowExecutionFailedEventAttributes',
    'childWorkflowExecutionStartedEventAttributes',
    'childWorkflowExecutionCompletedEventAttributes',
    'childWorkflowExecutionFailedEventAttributes',
    'childWorkflowExecutionCanceledEventAttributes',
    'childWorkflowExecutionTimedOutEventAttributes',
    'childWorkflowExecutionTerminatedEventAttributes',
    'signalExternalWorkflowExecutionInitiatedEventAttributes',
    'signalExternalWorkflowExecutionFailedEventAttributes',
    'externalWorkflowExecutionSignaledEventAttributes',
    'upsertWorkflowSearchAttributesEventAttributes',
];
export const findAttributeKey = (event) => {
    for (const key of eventAttributeKeys) {
        if (key in event)
            return key;
    }
};
export const findAttributes = (event, key) => {
    return event[key];
};
export const findAttributesAndKey = (event) => {
    const key = findAttributeKey(event);
    const attributes = findAttributes(event, key);
    return { key, attributes };
};
const hasAttributes = (key) => (event) => {
    return Boolean(event[key]);
};
export const isWorkflowExecutionStartedEvent = hasAttributes('workflowExecutionStartedEventAttributes');
export const isWorkflowExecutionCompletedEvent = hasAttributes('workflowExecutionCompletedEventAttributes');
export const isWorkflowExecutionFailedEvent = hasAttributes('workflowExecutionFailedEventAttributes');
export const isWorkflowExecutionTimedOutEvent = hasAttributes('workflowExecutionTimedOutEventAttributes');
export const isWorkflowTaskScheduledEvent = hasAttributes('workflowTaskScheduledEventAttributes');
export const isWorkflowTaskStartedEvent = hasAttributes('workflowTaskStartedEventAttributes');
export const isWorkflowTaskCompletedEvent = hasAttributes('workflowTaskCompletedEventAttributes');
export const isWorkflowTaskTimedOutEvent = hasAttributes('workflowTaskTimedOutEventAttributes');
export const isWorkflowTaskFailedEvent = hasAttributes('workflowTaskFailedEventAttributes');
export const isActivityTaskScheduledEvent = hasAttributes('activityTaskScheduledEventAttributes');
export const isActivityTaskStartedEvent = hasAttributes('activityTaskStartedEventAttributes');
export const isActivityTaskCompletedEvent = hasAttributes('activityTaskCompletedEventAttributes');
export const isActivityTaskFailedEvent = hasAttributes('activityTaskFailedEventAttributes');
export const isActivityTaskTimedOutEvent = hasAttributes('activityTaskTimedOutEventAttributes');
export const isTimerStartedEvent = hasAttributes('timerStartedEventAttributes');
export const isTimerFiredEvent = hasAttributes('timerFiredEventAttributes');
export const isActivityTaskCancelRequestedEvent = hasAttributes('activityTaskCancelRequestedEventAttributes');
export const isActivityTaskCanceledEvent = hasAttributes('activityTaskCanceledEventAttributes');
export const isTimerCanceledEvent = hasAttributes('timerCanceledEventAttributes');
export const isMarkerRecordedEvent = hasAttributes('markerRecordedEventAttributes');
export const isWorkflowExecutionSignaledEvent = hasAttributes('workflowExecutionSignaledEventAttributes');
export const isWorkflowExecutionTerminatedEvent = hasAttributes('workflowExecutionTerminatedEventAttributes');
export const isWorkflowExecutionCancelRequestedEvent = hasAttributes('workflowExecutionCancelRequestedEventAttributes');
export const isWorkflowExecutionCanceledEvent = hasAttributes('workflowExecutionCanceledEventAttributes');
export const isRequestCancelExternalWorkflowExecutionInitiatedEvent = hasAttributes('requestCancelExternalWorkflowExecutionInitiatedEventAttributes');
export const isRequestCancelExternalWorkflowExecutionFailedEvent = hasAttributes('requestCancelExternalWorkflowExecutionFailedEventAttributes');
export const isExternalWorkflowExecutionCancelRequestedEvent = hasAttributes('externalWorkflowExecutionCancelRequestedEventAttributes');
export const isWorkflowExecutionContinuedAsNewEvent = hasAttributes('workflowExecutionContinuedAsNewEventAttributes');
export const isStartChildWorkflowExecutionInitiatedEvent = hasAttributes('startChildWorkflowExecutionInitiatedEventAttributes');
export const isStartChildWorkflowExecutionFailedEvent = hasAttributes('startChildWorkflowExecutionFailedEventAttributes');
export const isChildWorkflowExecutionStartedEvent = hasAttributes('childWorkflowExecutionStartedEventAttributes');
export const isChildWorkflowExecutionCompletedEvent = hasAttributes('childWorkflowExecutionCompletedEventAttributes');
export const isChildWorkflowExecutionFailedEvent = hasAttributes('childWorkflowExecutionFailedEventAttributes');
export const isChildWorkflowExecutionCanceledEvent = hasAttributes('childWorkflowExecutionCanceledEventAttributes');
export const isChildWorkflowExecutionTimedOutEvent = hasAttributes('childWorkflowExecutionTimedOutEventAttributes');
export const isChildWorkflowExecutionTerminatedEvent = hasAttributes('childWorkflowExecutionTerminatedEventAttributes');
export const isSignalExternalWorkflowExecutionInitiatedEvent = hasAttributes('signalExternalWorkflowExecutionInitiatedEventAttributes');
export const isSignalExternalWorkflowExecutionFailedEvent = hasAttributes('signalExternalWorkflowExecutionFailedEventAttributes');
export const isExternalWorkflowExecutionSignaledEvent = hasAttributes('externalWorkflowExecutionSignaledEventAttributes');
export const isUpsertWorkflowSearchAttributesEvent = hasAttributes('upsertWorkflowSearchAttributesEventAttributes');
