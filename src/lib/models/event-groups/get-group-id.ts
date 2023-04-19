import {
  isActivityTaskCanceledEvent,
  isActivityTaskCancelRequestedEvent,
  isActivityTaskCompletedEvent,
  isActivityTaskFailedEvent,
  isActivityTaskStartedEvent,
  isActivityTaskTimedOutEvent,
  isChildWorkflowExecutionCompletedEvent,
  isChildWorkflowExecutionStartedEvent,
  isChildWorkflowExecutionTerminatedEvent,
  isTimerCanceledEvent,
  isTimerFiredEvent,
  isWorkflowTaskCompletedEvent,
  isWorkflowTaskFailedEvent,
  isWorkflowTaskStartedEvent,
  isWorkflowTaskTimedOutEvent,
} from '$lib/utilities/is-event-type';
import type { CommonHistoryEvent } from '$lib/types/events';

export const getGroupId = (event: CommonHistoryEvent): string => {
  if (isWorkflowTaskCompletedEvent(event))
    return String(event.workflowTaskCompletedEventAttributes.scheduledEventId);

  if (isWorkflowTaskStartedEvent(event))
    return String(event.workflowTaskStartedEventAttributes.scheduledEventId);

  if (isWorkflowTaskTimedOutEvent(event))
    return String(event.workflowTaskTimedOutEventAttributes.scheduledEventId);

  if (isWorkflowTaskFailedEvent(event))
    return String(event.workflowTaskFailedEventAttributes.scheduledEventId);

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

  if (isTimerFiredEvent(event)) {
    return String(event.timerFiredEventAttributes.startedEventId);
  }

  if (isTimerCanceledEvent(event)) {
    return String(event.timerCanceledEventAttributes.startedEventId);
  }

  return event.id;
};
