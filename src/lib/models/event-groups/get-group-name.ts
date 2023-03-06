import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isTimerStartedEvent,
  isLocalActivityMarkerEvent,
  isWorkflowTaskScheduledEvent,
} from '$lib/utilities/is-event-type';

export const getEventGroupName = (event: CommonHistoryEvent): string => {
  if (!event) return;

  if (isWorkflowTaskScheduledEvent(event)) {
    return 'Workflow Task';
  }

  if (isActivityTaskScheduledEvent(event)) {
    return `Activity Task: ${event.activityTaskScheduledEventAttributes?.activityType?.name}`;
  }

  if (isTimerStartedEvent(event)) {
    return `Timer Started`;
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return `Signal initiated`;
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return `Signal received`;
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return 'Local Activity';
    }
    return `Marker`;
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return `Child Workflow`;
  }
};
