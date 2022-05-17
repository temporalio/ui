import {
  isActivityTaskCanceledEvent,
  isActivityTaskFailedEvent,
  isActivityTaskTimedOutEvent,
  isChildWorkflowExecutionCanceledEvent,
  isChildWorkflowExecutionFailedEvent,
  isChildWorkflowExecutionTerminatedEvent,
  isChildWorkflowExecutionTimedOutEvent,
  isSignalExternalWorkflowExecutionFailedEvent,
  isTimerCanceledEvent,
  isWorkflowExecutionCanceledEvent,
  isWorkflowExecutionFailedEvent,
  isWorkflowExecutionTerminatedEvent,
  isWorkflowExecutionTimedOutEvent,
  isWorkflowTaskTimedOutEvent,
  isWorkflowTaskFailedEvent,
} from '$lib/utilities/is-event-type';
import { isEventGroup } from '$lib/models/event-groups';

export const eventIsFailureOrTimedOut = (event: WorkflowEvent): boolean => {
  return (
    isActivityTaskTimedOutEvent(event) ||
    isActivityTaskFailedEvent(event) ||
    isWorkflowExecutionFailedEvent(event) ||
    isWorkflowExecutionTimedOutEvent(event) ||
    isWorkflowTaskTimedOutEvent(event) ||
    isWorkflowTaskFailedEvent(event) ||
    isChildWorkflowExecutionFailedEvent(event) ||
    isChildWorkflowExecutionTimedOutEvent(event) ||
    isSignalExternalWorkflowExecutionFailedEvent(event)
  );
};

export const eventOrGroupIsFailureOrTimedOut = (
  event: IterableEvent,
): boolean => {
  if (isEventGroup(event)) return event.isFailureOrTimedOut;
  return eventIsFailureOrTimedOut(event as WorkflowEvent);
};

export const eventIsCanceled = (event: WorkflowEvent): boolean => {
  return (
    isActivityTaskCanceledEvent(event) ||
    isTimerCanceledEvent(event) ||
    isWorkflowExecutionCanceledEvent(event) ||
    isChildWorkflowExecutionCanceledEvent(event)
  );
};

export const eventOrGroupIsCanceled = (event: IterableEvent): boolean => {
  if (isEventGroup(event)) return event.isCanceled;
  return eventIsCanceled(event as WorkflowEvent);
};

export const eventIsTerminated = (event: WorkflowEvent): boolean => {
  return (
    isWorkflowExecutionTerminatedEvent(event) ||
    isChildWorkflowExecutionTerminatedEvent(event)
  );
};

export const eventOrGroupIsTerminated = (event: IterableEvent): boolean => {
  if (isEventGroup(event)) return event.isTerminated;
  return eventIsTerminated(event as WorkflowEvent);
};
