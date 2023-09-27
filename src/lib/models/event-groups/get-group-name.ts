import type { CommonHistoryEvent } from '$lib/types/events';
import { formatDurationAbbreviated } from '$lib/utilities/format-time';
import {
  isActivityTaskScheduledEvent,
  isLocalActivityMarkerEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
} from '$lib/utilities/is-event-type';

export const getEventGroupName = (event: CommonHistoryEvent): string => {
  if (!event) return;

  if (isActivityTaskScheduledEvent(event)) {
    return event.activityTaskScheduledEventAttributes?.activityType?.name;
  }

  if (isTimerStartedEvent(event)) {
    return `${event.timerStartedEventAttributes
      ?.timerId} (${formatDurationAbbreviated(
      event.timerStartedEventAttributes
        ?.startToFireTimeout as unknown as Duration,
    )})`;
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return `${event.signalExternalWorkflowExecutionInitiatedEventAttributes?.signalName}`;
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return `${event.workflowExecutionSignaledEventAttributes?.signalName}`;
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return 'Local Activity';
    }
    return `${event.markerRecordedEventAttributes?.markerName}`;
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return `${event.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType?.name}`;
  }

  if (isWorkflowExecutionUpdateAcceptedEvent(event)) {
    return `${event.workflowExecutionUpdateAcceptedEventAttributes?.acceptedRequest?.input?.name}`;
  }
};
