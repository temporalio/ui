import type { StartAndEndEventHistory } from '$lib/stores/events';
import type {
  WorkflowEvent,
  WorkflowExecutionCanceledEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionContinuedAsNewEvent,
  WorkflowExecutionFailedEvent,
  WorkflowExecutionStartedEvent,
  WorkflowExecutionTerminatedEvent,
  WorkflowExecutionTimedOutEvent,
  WorkflowTaskCompletedEvent,
  WorkflowTaskFailedEvent,
} from '$lib/types/events';

import {
  isWorkflowExecutionCompletedEvent,
  isWorkflowExecutionContinuedAsNewEvent,
} from './is-event-type';
import { stringifyWithBigInt } from './parse-with-big-int';

type WorkflowInputAndResults = {
  input: string;
  results: string;
  error: WorkflowTaskFailedEvent;
  contAsNew: boolean;
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
  if (isWorkflowExecutionContinuedAsNewEvent(event)) {
    return event.attributes.input?.payloads;
  }

  if (isWorkflowExecutionCompletedEvent(event)) {
    if (event.attributes.result === null) return null;
    return event.attributes.result.payloads;
  }

  return event.attributes;
};

export const getWorkflowStartedCompletedAndTaskFailedEvents = (
  eventHistory: StartAndEndEventHistory,
): WorkflowInputAndResults => {
  let input: string;
  let results: string;
  let error: WorkflowTaskFailedEvent;
  let contAsNew = false;

  let workflowStartedEvent: WorkflowExecutionStartedEvent;
  let workflowCompletedEvent: CompletionEvent;
  let workflowTaskFailedEvent: WorkflowTaskFailedEvent;
  let hasCompletedTaskEvent = false;

  for (const event of eventHistory.start) {
    if (isStartedEvent(event)) {
      workflowStartedEvent = event;
      continue;
    } else if (isCompletionEvent(event)) {
      workflowCompletedEvent = event;
      continue;
    } else if (isCompletedTaskEvent(event)) {
      // If there is a completed workflow task after a failed task
      if (workflowTaskFailedEvent) {
        // or we need to reset the failed event
        workflowTaskFailedEvent = undefined;
      }
      continue;
    } else if (!hasCompletedTaskEvent && isFailedTaskEvent(event)) {
      workflowTaskFailedEvent = event;
      continue;
    }
  }

  for (const event of eventHistory.end) {
    if (isStartedEvent(event)) {
      workflowStartedEvent = event;
      continue;
    } else if (isCompletionEvent(event)) {
      workflowCompletedEvent = event;
      continue;
    } else if (isCompletedTaskEvent(event)) {
      hasCompletedTaskEvent = true;
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
    contAsNew = isWorkflowExecutionContinuedAsNewEvent(workflowCompletedEvent);
    results = stringifyWithBigInt(getEventResult(workflowCompletedEvent));
  }

  if (workflowTaskFailedEvent) {
    error = workflowTaskFailedEvent;
  }

  return {
    input,
    results,
    error,
    contAsNew,
  };
};
