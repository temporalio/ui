import type { NormalizedHistoryEvent } from './types';
import type { ChildWorkflowExecutionReference } from '../workflow-execution/types';

/** Resolves a started child's identity and parent lifecycle; rejects incomplete start metadata. */
export function getChildWorkflowExecutionReference(
  parentNamespace: string,
  event: NormalizedHistoryEvent,
): ChildWorkflowExecutionReference | null {
  if (event.eventType !== 'ChildWorkflowExecutionStarted') {
    return null;
  }

  const attributes = event.childWorkflowExecutionStartedEventAttributes;
  const workflowId = attributes?.workflowExecution?.workflowId;
  const runId = attributes?.workflowExecution?.runId;
  const initiatedEventId = attributes?.initiatedEventId;

  if (
    !workflowId ||
    !runId ||
    !initiatedEventId ||
    String(initiatedEventId) === '0'
  ) {
    throw new Error(
      `Child workflow started event ${event.eventId} is missing its execution identity or initiated event ID`,
    );
  }

  return {
    headEventId: String(initiatedEventId),
    identity: {
      namespace: attributes.namespace || parentNamespace,
      workflowId,
      runId,
    },
  };
}
