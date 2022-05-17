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

const eventIsFailureOrTimedOut = (event) => {
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

const groupIsFailureOrTimedOut = (eventGroup: EventGroup): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupEvents = Array.from(eventGroup.events, ([key, value]) => value);
  return Boolean(groupEvents.find(eventIsFailureOrTimedOut));
};

export const eventOrGroupIsFailureOrTimedOut = (
  event: IterableEvent,
): boolean => {
  if (isEventGroup(event)) return groupIsFailureOrTimedOut(event);
  return eventIsFailureOrTimedOut(event as WorkflowEvent);
};

const eventIsCanceled = (event) => {
  return (
    isActivityTaskCanceledEvent(event) ||
    isTimerCanceledEvent(event) ||
    isWorkflowExecutionCanceledEvent(event) ||
    isChildWorkflowExecutionCanceledEvent(event)
  );
};

const groupIsCanceled = (eventGroup: EventGroup): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupEvents = Array.from(eventGroup.events, ([key, value]) => value);
  return Boolean(groupEvents.find(eventIsCanceled));
};

export const eventOrGroupIsCanceled = (event: IterableEvent): boolean => {
  if (isEventGroup(event)) return groupIsCanceled(event);
  return eventIsCanceled(event as WorkflowEvent);
};

const eventIsTerminated = (event) => {
  return (
    isWorkflowExecutionTerminatedEvent(event) ||
    isChildWorkflowExecutionTerminatedEvent(event)
  );
};

const groupIsTerminated = (eventGroup: EventGroup): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupEvents = Array.from(eventGroup.events, ([key, value]) => value);
  return Boolean(groupEvents.find(eventIsTerminated));
};

export const eventOrGroupIsTerminated = (event: IterableEvent): boolean => {
  if (isEventGroup(event)) return groupIsTerminated(event);
  return eventIsTerminated(event as WorkflowEvent);
};
