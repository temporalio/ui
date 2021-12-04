import type { GetWorkflowExecutionHistoryResponse } from '$types';

export const toEventHistory = (
  response: GetWorkflowExecutionHistoryResponse,
): WorkflowEvent[] => {
  return response.history.events.map(toEvent);
};

const eventAttributeKeys = [
  'activityTaskCancelRequestedEventAttributes',
  'activityTaskCompletedEventAttributes',
  'activityTaskFailedEventAttributes',
  'activityTaskScheduledEventAttributes',
  'activityTaskStartedEventAttributes',
  'activityTaskTimedOutEventAttributes',
  'childWorkflowExecutionCompletedEventAttributes',
  'childWorkflowExecutionStartedEventAttributes',
  'workflowTaskCompletedEventAttributes',
  'workflowTaskScheduledEventAttributes',
  'workflowTaskStartedEventAttributes',
  'workflowTaskTimedOutEventAttributes',
  'externalWorkflowExecutionSignaledEventAttributes',
  'startChildWorkflowExecutionInitiatedEventAttributes',
  'signalExternalWorkflowExecutionInitiatedEventAttributes',
  'timerStartedEventAttributes',
  'workflowExecutionStartedEventAttributes',
  'workflowExecutionCompletedEventAttributes',
  'workflowExecutionFailedEventAttributes',
  'workflowExecutionTimedOutEventAttributes',
  'workflowTaskFailedEventAttributes',
  'childWorkflowExecutionFailedEventAttributes',
];

const getAttributes = (event: HistoryEvent): EventAttributes => {
  for (const key of eventAttributeKeys) {
    if (event[key]) return event[key];
  }
};

export const toEvent = (event: HistoryEvent): WorkflowEvent => {
  return {
    ...event,
    eventType: event.eventType as unknown as EventType,
    id: String(event.eventId),
    attributes: getAttributes(event),
  };
};
