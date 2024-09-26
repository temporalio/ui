import type { CommonHistoryEvent } from '$lib/types/events';
import {
  isActivityTaskCanceledEvent,
  isActivityTaskCancelRequestedEvent,
  isActivityTaskCompletedEvent,
  isActivityTaskFailedEvent,
  isActivityTaskStartedEvent,
  isActivityTaskTimedOutEvent,
  isChildWorkflowExecutionCanceledEvent,
  isChildWorkflowExecutionCompletedEvent,
  isChildWorkflowExecutionFailedEvent,
  isChildWorkflowExecutionStartedEvent,
  isChildWorkflowExecutionTerminatedEvent,
  isChildWorkflowExecutionTimedOutEvent,
  isExternalWorkflowExecutionSignaledEvent,
  isNexusOperationCanceledEvent,
  isNexusOperationCompletedEvent,
  isNexusOperationFailedEvent,
  isNexusOperationStartedEvent,
  isPureWorkflowTaskFailedEvent,
  isTimerCanceledEvent,
  isTimerFiredEvent,
  isWorkflowExecutionUpdateCompletedEvent,
  isWorkflowTaskCompletedEvent,
  isWorkflowTaskStartedEvent,
  isWorkflowTaskTimedOutEvent,
} from '$lib/utilities/is-event-type';

export const getGroupId = (event: CommonHistoryEvent): string => {
  if (isActivityTaskStartedEvent(event))
    return String(event.activityTaskStartedEventAttributes.scheduledEventId);

  if (isActivityTaskCanceledEvent(event)) {
    return String(event.activityTaskCanceledEventAttributes.scheduledEventId);
  }

  if (isActivityTaskCancelRequestedEvent(event)) {
    return String(
      event.activityTaskCancelRequestedEventAttributes.scheduledEventId,
    );
  }

  if (isActivityTaskFailedEvent(event)) {
    return String(event.activityTaskFailedEventAttributes.scheduledEventId);
  }

  if (isActivityTaskTimedOutEvent(event)) {
    return String(event.activityTaskTimedOutEventAttributes.scheduledEventId);
  }

  if (isActivityTaskCompletedEvent(event)) {
    return String(event.activityTaskCompletedEventAttributes.scheduledEventId);
  }

  if (isChildWorkflowExecutionStartedEvent(event)) {
    return String(
      event.childWorkflowExecutionStartedEventAttributes.initiatedEventId,
    );
  }

  if (isChildWorkflowExecutionTerminatedEvent(event)) {
    return String(
      event.childWorkflowExecutionTerminatedEventAttributes.initiatedEventId,
    );
  }

  if (isChildWorkflowExecutionCompletedEvent(event)) {
    return String(
      event.childWorkflowExecutionCompletedEventAttributes.initiatedEventId,
    );
  }

  if (isChildWorkflowExecutionCanceledEvent(event)) {
    return String(
      event.childWorkflowExecutionCanceledEventAttributes.initiatedEventId,
    );
  }

  if (isChildWorkflowExecutionFailedEvent(event)) {
    return String(
      event.childWorkflowExecutionFailedEventAttributes.initiatedEventId,
    );
  }

  if (isChildWorkflowExecutionTimedOutEvent(event)) {
    return String(
      event.childWorkflowExecutionTimedOutEventAttributes.initiatedEventId,
    );
  }

  if (isTimerFiredEvent(event)) {
    return String(event.timerFiredEventAttributes.startedEventId);
  }

  if (isTimerCanceledEvent(event)) {
    return String(event.timerCanceledEventAttributes.startedEventId);
  }

  if (isWorkflowExecutionUpdateCompletedEvent(event)) {
    return String(
      event.workflowExecutionUpdateCompletedEventAttributes.acceptedEventId,
    );
  }

  if (isExternalWorkflowExecutionSignaledEvent(event)) {
    return String(
      event.externalWorkflowExecutionSignaledEventAttributes.initiatedEventId,
    );
  }

  if (isWorkflowTaskStartedEvent(event)) {
    return String(event.workflowTaskStartedEventAttributes.scheduledEventId);
  }

  if (isWorkflowTaskCompletedEvent(event)) {
    return String(event.workflowTaskCompletedEventAttributes.scheduledEventId);
  }

  if (isPureWorkflowTaskFailedEvent(event)) {
    return String(event.workflowTaskFailedEventAttributes.scheduledEventId);
  }

  if (isWorkflowTaskTimedOutEvent(event)) {
    return String(event.workflowTaskTimedOutEventAttributes.scheduledEventId);
  }

  if (isNexusOperationStartedEvent(event)) {
    return String(event.nexusOperationStartedEventAttributes.scheduledEventId);
  }

  if (isNexusOperationCompletedEvent(event)) {
    return String(
      event.nexusOperationCompletedEventAttributes.scheduledEventId,
    );
  }

  if (isNexusOperationFailedEvent(event)) {
    return String(event.nexusOperationFailedEventAttributes.scheduledEventId);
  }

  if (isNexusOperationCanceledEvent(event)) {
    return String(event.nexusOperationCanceledEventAttributes.scheduledEventId);
  }

  return event.id;
};
