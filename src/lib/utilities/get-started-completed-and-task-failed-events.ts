import type {
  WorkflowEvent,
  WorkflowExecutionCanceledEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionContinuedAsNewEvent,
  WorkflowExecutionFailedEvent,
  WorkflowExecutionStartedEvent,
  WorkflowExecutionTerminatedEvent,
  WorkflowExecutionTimedOutEvent,
} from '$lib/types/events';

import {
  isWorkflowExecutionCompletedEvent,
  isWorkflowExecutionContinuedAsNewEvent,
} from './is-event-type';
import { stringifyWithBigInt } from './parse-with-big-int';

export type WorkflowInputAndResults = {
  input: string;
  results: string;
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

const getEventResult = (event: CompletionEvent) => {
  if (isWorkflowExecutionContinuedAsNewEvent(event)) {
    return event.attributes.input;
  }

  if (isWorkflowExecutionCompletedEvent(event)) {
    if (event.attributes.result === null) return null;
    return event.attributes.result;
  }

  return event.attributes;
};

export const getWorkflowStartedCompletedAndTaskFailedEvents = (
  eventHistory: WorkflowEvent[],
): WorkflowInputAndResults => {
  let input: string;
  let results: string;
  let contAsNew = false;

  let workflowStartedEvent: WorkflowExecutionStartedEvent;
  let workflowCompletedEvent: CompletionEvent;

  for (const event of eventHistory) {
    if (isStartedEvent(event)) {
      workflowStartedEvent = event;
      continue;
    } else if (isCompletionEvent(event)) {
      workflowCompletedEvent = event;
      continue;
    }
  }

  if (workflowStartedEvent) {
    input = stringifyWithBigInt(
      workflowStartedEvent?.workflowExecutionStartedEventAttributes?.input ??
        null,
    );
  }

  if (workflowCompletedEvent) {
    contAsNew = isWorkflowExecutionContinuedAsNewEvent(workflowCompletedEvent);
    results = stringifyWithBigInt(getEventResult(workflowCompletedEvent));
  }

  return {
    input,
    results,
    contAsNew,
  };
};
