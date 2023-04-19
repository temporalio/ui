import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isTimerStartedEvent,
  isLocalActivityMarkerEvent,
} from '$lib/utilities/is-event-type';
import { formatDurationAbbreviated } from '$lib/utilities/format-time';
import type { CommonHistoryEvent } from '$lib/types/events';

export const getEventGroupName = (event: CommonHistoryEvent): string => {
  if (!event) return;

  if (isActivityTaskScheduledEvent(event)) {
    return event.activityTaskScheduledEventAttributes?.activityType?.name;
  }

  if (isTimerStartedEvent(event)) {
    return `Timer ${
      event.timerStartedEventAttributes?.timerId
    } (${formatDurationAbbreviated(
      event.timerStartedEventAttributes
        ?.startToFireTimeout as unknown as Duration,
    )})`;
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return `Signal: ${event.signalExternalWorkflowExecutionInitiatedEventAttributes?.signalName}`;
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return `Signal received: ${event.workflowExecutionSignaledEventAttributes?.signalName}`;
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return 'Local Activity';
    }
    return `Marker: ${event.markerRecordedEventAttributes?.markerName}`;
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return `Child Workflow: ${event.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType?.name}`;
  }
};
