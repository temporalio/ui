import type { WorkflowInputAndResults } from '$lib/utilities/get-started-completed-and-task-failed-events';

import type { QualifiedHistoryEvent } from '../data/history-events/types';
import { compareEventIds } from '../data/identity-keys';

function isCompletionEvent(event: QualifiedHistoryEvent): boolean {
  switch (event.eventType) {
    case 'WorkflowExecutionCompleted':
    case 'WorkflowExecutionContinuedAsNew':
    case 'WorkflowExecutionFailed':
    case 'WorkflowExecutionTimedOut':
    case 'WorkflowExecutionCanceled':
    case 'WorkflowExecutionTerminated':
      return true;
    default:
      return false;
  }
}

function getResult(
  event: QualifiedHistoryEvent,
): WorkflowInputAndResults['results'] {
  switch (event.eventType) {
    case 'WorkflowExecutionCompleted':
      return event.workflowExecutionCompletedEventAttributes?.result;
    case 'WorkflowExecutionContinuedAsNew':
      return event.workflowExecutionContinuedAsNewEventAttributes?.input;
    case 'WorkflowExecutionFailed': {
      const attributes = event.workflowExecutionFailedEventAttributes;
      return attributes
        ? { ...attributes, type: 'workflowExecutionFailedEventAttributes' }
        : undefined;
    }
    case 'WorkflowExecutionTimedOut': {
      const attributes = event.workflowExecutionTimedOutEventAttributes;
      return attributes
        ? { ...attributes, type: 'workflowExecutionTimedOutEventAttributes' }
        : undefined;
    }
    case 'WorkflowExecutionCanceled': {
      const attributes = event.workflowExecutionCanceledEventAttributes;
      return attributes
        ? { ...attributes, type: 'workflowExecutionCanceledEventAttributes' }
        : undefined;
    }
    case 'WorkflowExecutionTerminated': {
      const attributes = event.workflowExecutionTerminatedEventAttributes;
      return attributes
        ? { ...attributes, type: 'workflowExecutionTerminatedEventAttributes' }
        : undefined;
    }
    default:
      return undefined;
  }
}

/** Selects legacy-compatible payloads from one execution, regardless of page arrival order. */
export function getInputAndResults(events: readonly QualifiedHistoryEvent[]) {
  let started: QualifiedHistoryEvent | undefined;
  let completed: QualifiedHistoryEvent | undefined;

  for (const event of events) {
    if (
      event.eventType === 'WorkflowExecutionStarted' &&
      (!started || compareEventIds(event.eventId, started.eventId) > 0)
    ) {
      started = event;
    }

    if (
      isCompletionEvent(event) &&
      (!completed || compareEventIds(event.eventId, completed.eventId) > 0)
    ) {
      completed = event;
    }
  }

  return {
    input: started?.workflowExecutionStartedEventAttributes?.input,
    results: completed ? getResult(completed) : undefined,
    contAsNew: completed?.eventType === 'WorkflowExecutionContinuedAsNew',
    hasCompletion: !!completed,
  };
}
