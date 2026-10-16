import type { ExecutionRelation } from './types';
import type { QualifiedHistoryEvent } from '../history-events/types';
import {
  type ExecutionIdentity,
  getEventKey,
  getExecutionKey,
} from '../identity-keys';

/** Returns the execution relationship discovered by a history event, if any. */
export function getExecutionRelation(
  sourceIdentity: ExecutionIdentity,
  event: QualifiedHistoryEvent,
): ExecutionRelation | null {
  switch (event.eventType) {
    case 'WorkflowExecutionStarted': {
      const previousRunId =
        event.workflowExecutionStartedEventAttributes?.continuedExecutionRunId;

      if (!previousRunId) {
        return null;
      }

      return {
        kind: 'execution-chain',
        previousExecutionKey: getExecutionKey({
          ...sourceIdentity,
          runId: previousRunId,
        }),
        nextExecutionIdentity: { ...sourceIdentity },
      };
    }

    case 'WorkflowExecutionContinuedAsNew': {
      const nextRunId =
        event.workflowExecutionContinuedAsNewEventAttributes?.newExecutionRunId;

      if (!nextRunId) {
        return null;
      }

      return {
        kind: 'execution-chain',
        previousExecutionKey: event.executionKey,
        nextExecutionIdentity: { ...sourceIdentity, runId: nextRunId },
      };
    }

    case 'WorkflowExecutionCompleted': {
      const nextRunId =
        event.workflowExecutionCompletedEventAttributes?.newExecutionRunId;

      if (!nextRunId) {
        return null;
      }

      return {
        kind: 'execution-chain',
        previousExecutionKey: event.executionKey,
        nextExecutionIdentity: { ...sourceIdentity, runId: nextRunId },
      };
    }

    case 'WorkflowExecutionFailed': {
      const nextRunId =
        event.workflowExecutionFailedEventAttributes?.newExecutionRunId;

      if (!nextRunId) {
        return null;
      }

      return {
        kind: 'execution-chain',
        previousExecutionKey: event.executionKey,
        nextExecutionIdentity: { ...sourceIdentity, runId: nextRunId },
      };
    }

    case 'WorkflowExecutionTimedOut': {
      const nextRunId =
        event.workflowExecutionTimedOutEventAttributes?.newExecutionRunId;

      if (!nextRunId) {
        return null;
      }

      return {
        kind: 'execution-chain',
        previousExecutionKey: event.executionKey,
        nextExecutionIdentity: { ...sourceIdentity, runId: nextRunId },
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
