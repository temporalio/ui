import type { NormalizedHistoryEvent } from './types';
import type { WorkflowExecutionIdentity } from '../workflow-execution/types';

/** Returns the successor identity reported by a workflow closing event. */
export function getNextExecutionIdentity(
  identity: WorkflowExecutionIdentity,
  event: NormalizedHistoryEvent,
): WorkflowExecutionIdentity | null {
  let runId: string | null | undefined;

  switch (event.eventType) {
    case 'WorkflowExecutionContinuedAsNew': {
      runId =
        event.workflowExecutionContinuedAsNewEventAttributes?.newExecutionRunId;
      break;
    }

    case 'WorkflowExecutionCompleted': {
      runId =
        event.workflowExecutionCompletedEventAttributes?.newExecutionRunId;
      break;
    }

    case 'WorkflowExecutionFailed': {
      runId = event.workflowExecutionFailedEventAttributes?.newExecutionRunId;
      break;
    }

    case 'WorkflowExecutionTimedOut': {
      runId = event.workflowExecutionTimedOutEventAttributes?.newExecutionRunId;
      break;
    }

    default: {
      return null;
    }
  }

  if (!runId) {
    return null;
  }

  return { ...identity, runId };
}
