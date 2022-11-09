import { isWorkflowExecutionCompletedEvent } from './is-event-type';
import { stringifyWithBigInt } from './parse-with-big-int';
import type { EventSortOrder } from '$lib/stores/event-view';

type WorkflowInputAndResults = {
  input: string;
  results: string;
  error: WorkflowTaskFailedEvent;
};

type CompletionEvent =
  | WorkflowExecutionFailedEvent
  | WorkflowExecutionCompletedEvent
  | WorkflowExecutionContinuedAsNewEvent
  | WorkflowExecutionTimedOutEvent
  | WorkflowExecutionCanceledEvent
  | WorkflowExecutionTerminatedEvent;

const completedEventTypes = [
  'WorkflowExecutionFailed',
  'WorkflowExecutionCompleted',
  'WorkflowExecutionContinuedAsNew',
  'WorkflowExecutionTimedOut',
  'WorkflowExecutionCanceled',
  'WorkflowExecutionTerminated',
] as const;

const isStartedEvent = (
  event: WorkflowEvent,
): event is WorkflowExecutionStartedEvent => {
  return !!event.workflowExecutionStartedEventAttributes;
};

const isCompletionEvent = (event: WorkflowEvent): event is CompletionEvent => {
  for (const completionType of completedEventTypes) {
    if (event.eventType === completionType) return true;
  }
  return false;
};

const isFailedTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskFailedEvent => {
  return event.eventType === 'WorkflowTaskFailed';
};

const isCompletedTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskCompletedEvent => {
  return event.eventType === 'WorkflowTaskCompleted';
};

const getEventResult = (event: CompletionEvent) => {
  if (isWorkflowExecutionCompletedEvent(event)) {
    if (event.attributes.result === null) return null;
    return event.attributes.result.payloads;
  }

  return event.attributes;
};

export const getWorkflowStartedCompletedAndTaskFailedEvents = (
  events: WorkflowEvents,
  eventSortOrder: EventSortOrder = 'descending',
): WorkflowInputAndResults => {
  let input: string;
  let results: string;
  let error: WorkflowTaskFailedEvent;

  let workflowStartedEvent: WorkflowExecutionStartedEvent;
  let workflowCompletedEvent: CompletionEvent;
  let workflowTaskFailedEvent: WorkflowTaskFailedEvent;
  let hasCompletedTaskEvent = false;

  for (const event of events) {
    if (isStartedEvent(event)) {
      workflowStartedEvent = event;
      continue;
    } else if (isCompletionEvent(event)) {
      workflowCompletedEvent = event;
      continue;
    } else if (isCompletedTaskEvent(event)) {
      // If there is a completed workflow task after a failed task
      if (eventSortOrder === 'descending') {
        // then we don't need to look for a failed task
        hasCompletedTaskEvent = true;
      } else if (eventSortOrder === 'ascending' && workflowTaskFailedEvent) {
        // or we need to reset the failed event
        workflowTaskFailedEvent = undefined;
      }
      continue;
    } else if (!hasCompletedTaskEvent && isFailedTaskEvent(event)) {
      workflowTaskFailedEvent = event;
      continue;
    }
  }

  if (workflowStartedEvent) {
    input = stringifyWithBigInt(
      workflowStartedEvent?.workflowExecutionStartedEventAttributes?.input
        ?.payloads ?? null,
    );
  }

  if (workflowCompletedEvent) {
    results = stringifyWithBigInt(getEventResult(workflowCompletedEvent));
  }

  if (workflowTaskFailedEvent) {
    error = workflowTaskFailedEvent;
  }

  return {
    input,
    results,
    error,
  };
};
