import type { ExecutionRelation } from './types';
import type { QualifiedHistoryEvent } from '../history-events/types';
import { type ExecutionIdentity, getEventKey } from '../identity-keys';

/** Returns the execution relationship discovered by a history event, if any. */
export function getExecutionRelation(
  sourceIdentity: ExecutionIdentity,
  event: QualifiedHistoryEvent,
): ExecutionRelation | null {
  switch (event.eventType) {
    case 'WorkflowExecutionContinuedAsNew': {
      const runId =
        event.workflowExecutionContinuedAsNewEventAttributes?.newExecutionRunId;

      if (!runId) {
        return null;
      }

      return {
        kind: 'continue-as-new',
        previousExecutionKey: event.executionKey,
        nextExecutionIdentity: {
          namespace: sourceIdentity.namespace,
          workflowId: sourceIdentity.workflowId,
          runId,
        },
        continuedAsNewEventKey: event.eventKey,
      };
    }

    case 'ChildWorkflowExecutionStarted': {
      const attributes = event.childWorkflowExecutionStartedEventAttributes;
      const workflowId = attributes?.workflowExecution?.workflowId;
      const runId = attributes?.workflowExecution?.runId;
      const initiatedEventId = attributes?.initiatedEventId;

      if (!workflowId || !runId || !initiatedEventId) {
        return null;
      }

      const initiatedId = String(initiatedEventId);

      return {
        kind: 'child-workflow',
        parentExecutionKey: event.executionKey,
        childExecutionIdentity: {
          namespace: attributes.namespace || sourceIdentity.namespace,
          workflowId,
          runId,
        },
        initiatedEventId: initiatedId,
        initiatedEventKey: getEventKey(event.executionKey, initiatedId),
        startedEventKey: event.eventKey,
      };
    }

    default: {
      return null;
    }
  }
}
