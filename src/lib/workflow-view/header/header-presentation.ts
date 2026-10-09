import type { WorkflowExecution } from '$lib/types/workflows';

import type { ExecutionGraphSnapshot } from '../data/execution-graph/types';
import type { QualifiedHistoryEvent } from '../data/history-events/types';
import { type ExecutionIdentity, getExecutionKey } from '../data/identity-keys';

/** Derives selected-run relationships and cancellation from canonical data. */
export function getHeaderPresentation(
  identity: ExecutionIdentity,
  details: WorkflowExecution,
  events: readonly QualifiedHistoryEvent[],
  graph: ExecutionGraphSnapshot,
) {
  const started = events.find(
    (event) => event.eventType === 'WorkflowExecutionStarted',
  )?.workflowExecutionStartedEventAttributes;
  const firstRunId = started?.firstExecutionRunId;
  const previousRunId = started?.continuedExecutionRunId;
  const closedChildTypes = new Set([
    'ChildWorkflowExecutionCompleted',
    'ChildWorkflowExecutionFailed',
    'ChildWorkflowExecutionCanceled',
    'ChildWorkflowExecutionTerminated',
    'ChildWorkflowExecutionTimedOut',
  ]);
  const closedChildren = events.filter((event) =>
    closedChildTypes.has(event.eventType),
  ).length;

  let executionKey = getExecutionKey(identity);
  let latestRunId: string | undefined;
  let nextRunId: string | undefined;
  const visited = new Set([executionKey]);
  for (;;) {
    const relation = graph.relations.find(
      (candidate) =>
        candidate.kind === 'execution-chain' &&
        candidate.previousExecutionKey === executionKey,
    );
    if (!relation || relation.kind !== 'execution-chain') break;

    nextRunId ??= relation.nextExecutionIdentity.runId;
    latestRunId = relation.nextExecutionIdentity.runId;
    executionKey = getExecutionKey(relation.nextExecutionIdentity);
    if (visited.has(executionKey)) break;
    visited.add(executionKey);
  }

  const relationshipCount =
    Number(Boolean(details.parent)) +
    details.pendingChildren.length +
    closedChildren +
    Number(Boolean(firstRunId && firstRunId !== identity.runId)) +
    Number(Boolean(previousRunId)) +
    Number(Boolean(nextRunId)) +
    Number(
      Boolean(details.searchAttributes?.indexedFields?.TemporalScheduledById),
    );

  return {
    latestRunId,
    relationshipCount,
    cancelInProgress:
      (details.isRunning || details.isPaused) &&
      events.some(
        (event) => event.eventType === 'WorkflowExecutionCancelRequested',
      ),
  };
}
