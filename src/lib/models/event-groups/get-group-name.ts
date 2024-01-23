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
  if (!event) return '';

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
    return event.signalExternalWorkflowExecutionInitiatedEventAttributes
      ?.signalName;
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return event.workflowExecutionSignaledEventAttributes?.signalName;
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return 'Local Activity';
    }
    return event.markerRecordedEventAttributes?.markerName;
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return event.startChildWorkflowExecutionInitiatedEventAttributes
      ?.workflowType?.name;
  }

  if (isWorkflowExecutionUpdateAcceptedEvent(event)) {
    return event.workflowExecutionUpdateAcceptedEventAttributes?.acceptedRequest
      ?.input?.name;
  }
};

export const getEventGroupLabel = (event: CommonHistoryEvent): string => {
  if (!event) return '';

  if (isActivityTaskScheduledEvent(event)) {
    return '';
  }

  if (isTimerStartedEvent(event)) {
    return 'Timer';
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return 'Signal';
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return 'Signal received';
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return '';
    }
    return 'Marker';
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return 'Child Workflow';
  }

  if (isWorkflowExecutionUpdateAcceptedEvent(event)) {
    return '';
  }
};

export const getEventGroupDisplayName = (event: CommonHistoryEvent): string => {
  if (!event) return '';

  if (getEventGroupLabel(event)) {
    return `${getEventGroupLabel(event)}: ${getEventGroupName(event)}`;
  }
  return getEventGroupName(event);
};
