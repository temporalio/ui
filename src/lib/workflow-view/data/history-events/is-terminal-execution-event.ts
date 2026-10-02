import type { EventType } from '$lib/utilities/is-event-type';

const terminalExecutionEventTypes = new Set<EventType>([
  'WorkflowExecutionCompleted',
  'WorkflowExecutionFailed',
  'WorkflowExecutionCanceled',
  'WorkflowExecutionTerminated',
  'WorkflowExecutionTimedOut',
  'WorkflowExecutionContinuedAsNew',
]);

/** Whether a readable history event type ends its workflow execution. */
export function isTerminalExecutionEvent(eventType: EventType): boolean {
  return terminalExecutionEventTypes.has(eventType);
}
