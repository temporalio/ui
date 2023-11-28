import { isEventGroup } from '$lib/models/event-groups';
import type { IterableEvent, WorkflowEvent } from '$lib/types/events';
import {
  isActivityTaskCanceledEvent,
  isActivityTaskCompletedEvent,
  isActivityTaskFailedEvent,
  isActivityTaskTimedOutEvent,
  isChildWorkflowExecutionCanceledEvent,
  isChildWorkflowExecutionCompletedEvent,
  isChildWorkflowExecutionFailedEvent,
  isChildWorkflowExecutionTerminatedEvent,
  isChildWorkflowExecutionTimedOutEvent,
  isFailedWorkflowExecutionUpdateCompletedEvent,
  isSignalExternalWorkflowExecutionFailedEvent,
  isTimerCanceledEvent,
  isWorkflowExecutionCanceledEvent,
  isWorkflowExecutionCompletedEvent,
  isWorkflowExecutionFailedEvent,
  isWorkflowExecutionTerminatedEvent,
  isWorkflowExecutionTimedOutEvent,
  isWorkflowTaskCompletedEvent,
  isWorkflowTaskFailedEvent,
  isWorkflowTaskTimedOutEvent,
} from '$lib/utilities/is-event-type';

export const eventIsFailure = (event: WorkflowEvent): boolean => {
  return (
    isActivityTaskFailedEvent(event) ||
    isWorkflowExecutionFailedEvent(event) ||
    isWorkflowTaskFailedEvent(event) ||
    isChildWorkflowExecutionFailedEvent(event) ||
    isSignalExternalWorkflowExecutionFailedEvent(event) ||
    isFailedWorkflowExecutionUpdateCompletedEvent(event)
  );
};

export const eventOrGroupIsFailure = (event: IterableEvent): boolean => {
  if (isEventGroup(event)) return event.isFailure;
  return eventIsFailure(event as WorkflowEvent);
};

export const eventIsTimedOut = (event: WorkflowEvent): boolean => {
  return (
    isActivityTaskTimedOutEvent(event) ||
    isWorkflowExecutionTimedOutEvent(event) ||
    isWorkflowTaskTimedOutEvent(event) ||
    isChildWorkflowExecutionTimedOutEvent(event)
  );
};

export const eventOrGroupIsTimedOut = (event: IterableEvent): boolean => {
  if (isEventGroup(event)) return event.isTimedOut;
  return eventIsTimedOut(event as WorkflowEvent);
};

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
    isSignalExternalWorkflowExecutionFailedEvent(event) ||
    isFailedWorkflowExecutionUpdateCompletedEvent(event)
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

export const eventIsCompleted = (event: WorkflowEvent): boolean => {
  return (
    isWorkflowExecutionCompletedEvent(event) ||
    isActivityTaskCompletedEvent(event) ||
    isWorkflowTaskCompletedEvent(event) ||
    isChildWorkflowExecutionCompletedEvent(event)
  );
};
export const eventOrGroupIsCompleted = (event: IterableEvent): boolean => {
  if (isEventGroup(event)) return event.isCompleted;
  return eventIsCompleted(event as WorkflowEvent);
};
