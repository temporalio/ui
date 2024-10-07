import type { CommonHistoryEvent } from '$lib/types/events';
import { formatDurationAbbreviated } from '$lib/utilities/format-time';
import { getSummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
import {
  isActivityTaskScheduledEvent,
  isLocalActivityMarkerEvent,
  isMarkerRecordedEvent,
  isNexusOperationScheduledEvent,
  isNexusOperationStartedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
  isWorkflowExecutionUpdateAdmittedEvent,
} from '$lib/utilities/is-event-type';

export const getEventGroupName = (
  event: CommonHistoryEvent,
  initialEvent?: CommonHistoryEvent,
): string => {
  if (!event) return '';

  if (isActivityTaskScheduledEvent(event)) {
    return event.activityTaskScheduledEventAttributes?.activityType?.name;
  }

  if (isTimerStartedEvent(event)) {
    return `${event.timerStartedEventAttributes
      ?.timerId} (${formatDurationAbbreviated(
      event.timerStartedEventAttributes?.startToFireTimeout,
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
    if (isWorkflowExecutionUpdateAdmittedEvent(initialEvent)) {
      return initialEvent.workflowExecutionUpdateAdmittedEventAttributes
        ?.request?.input?.name;
    } else {
      return event.workflowExecutionUpdateAcceptedEventAttributes
        ?.acceptedRequest?.input?.name;
    }
  }

  if (isNexusOperationScheduledEvent(event)) {
    return `${event.nexusOperationScheduledEventAttributes.service}.${event.nexusOperationScheduledEventAttributes.operation}`;
  }
};

export const getEventGroupLabel = (event: CommonHistoryEvent): string => {
  if (!event) return '';

  if (isActivityTaskScheduledEvent(event)) {
    return 'Activity';
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

  if (isLocalActivityMarkerEvent(event)) {
    return 'Local Activity';
  }

  if (isMarkerRecordedEvent(event)) {
    return 'Marker';
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return 'Child Workflow';
  }

  if (isWorkflowExecutionUpdateAcceptedEvent(event)) {
    return 'Workflow Update';
  }

  if (
    isNexusOperationScheduledEvent(event) ||
    isNexusOperationStartedEvent(event)
  ) {
    return 'Nexus Operation';
  }
};

export const getEventGroupDisplayName = (
  event: CommonHistoryEvent,
  initialEvent?: CommonHistoryEvent,
): string => {
  if (!event) return '';

  if (isLocalActivityMarkerEvent(event)) {
    return getSummaryAttribute(event)?.value?.toString() ?? 'Local Activity';
  }

  return getEventGroupName(event, initialEvent);
};
