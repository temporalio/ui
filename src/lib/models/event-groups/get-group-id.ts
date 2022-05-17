import {
  isActivityTaskCanceledEvent,
  isActivityTaskCancelRequestedEvent,
  isActivityTaskCompletedEvent,
  isActivityTaskFailedEvent,
  isActivityTaskScheduledEvent,
  isActivityTaskStartedEvent,
  isActivityTaskTimedOutEvent,
  isChildWorkflowExecutionCompletedEvent,
  isChildWorkflowExecutionStartedEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isTimerCanceledEvent,
  isTimerFiredEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';

export const getGroupId = (event: CommonHistoryEvent): string => {
  if (isActivityTaskScheduledEvent(event)) return event.id;

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) return event.id;

  if (isTimerStartedEvent(event)) return event.id;

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) return event.id;

  if (isWorkflowExecutionSignaledEvent(event)) return event.id;

  if (isMarkerRecordedEvent(event)) return event.id;

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
};
