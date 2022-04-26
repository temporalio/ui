import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';

export const getEventGroupName = (event: CommonHistoryEvent): string => {
  if (!event) return;

  if (isActivityTaskScheduledEvent(event)) {
    return event.activityTaskScheduledEventAttributes?.activityType?.name;
  }

  if (isTimerStartedEvent(event)) {
    return `Timer ${event.timerStartedEventAttributes?.timerId} (${event.timerStartedEventAttributes?.startToFireTimeout})`;
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return `Signal: ${event.signalExternalWorkflowExecutionInitiatedEventAttributes?.signalName}`;
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return `Signal received: ${event.workflowExecutionSignaledEventAttributes?.signalName}`;
  }

  if (isMarkerRecordedEvent(event)) {
    return `Marker: ${event.markerRecordedEventAttributes?.markerName}`;
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return `Child Workflow: ${event.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType?.name}`;
  }
};
