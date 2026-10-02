import { orderExecutionEntries } from './order-execution-entries';
import type { ChildWorkflowEntry, WorkflowScene } from './types';
import type {
  ChildWorkflowRelation,
  ExecutionGraphSnapshot,
} from '../../../data/execution-graph/types';
import {
  type ExecutionKey,
  getExecutionKey,
} from '../../../data/identity-keys';
import type { TimelineEventRow } from '../timeline-rows/types';

/** Projects discovered runs, child workflows, and event rows into a nested scene. */
export function projectWorkflowScene(
  graph: ExecutionGraphSnapshot,
  rows: readonly TimelineEventRow[],
  rootExecutionKey: ExecutionKey,
): WorkflowScene | null {
  if (!graph.executionsByKey.has(rootExecutionKey)) {
    return null;
  }

  const previousByNext = new Map<ExecutionKey, ExecutionKey>();
  const nextByPrevious = new Map<ExecutionKey, ExecutionKey>();
  const childrenByParent = new Map<ExecutionKey, ChildWorkflowRelation[]>();

  for (const relation of graph.relations) {
    if (relation.kind === 'continue-as-new') {
      const nextKey = getExecutionKey(relation.nextExecutionIdentity);
      previousByNext.set(nextKey, relation.previousExecutionKey);
      nextByPrevious.set(relation.previousExecutionKey, nextKey);
    } else {
      const children = childrenByParent.get(relation.parentExecutionKey) ?? [];
      children.push(relation);
      childrenByParent.set(relation.parentExecutionKey, children);
    }
  }

  const rowsByExecution = new Map<ExecutionKey, TimelineEventRow[]>();

  for (const row of rows) {
    const executionRows = rowsByExecution.get(row.executionKey) ?? [];
    executionRows.push(row);
    rowsByExecution.set(row.executionKey, executionRows);
  }

  const projectedExecutions = new Set<ExecutionKey>();

  function buildWorkflow(startKey: ExecutionKey): WorkflowScene | null {
    const start = graph.executionsByKey.get(startKey);

    if (!start || projectedExecutions.has(startKey)) {
      return null;
    }

    let firstKey = startKey;
    const precedingKeys = new Set<ExecutionKey>([firstKey]);

    while (previousByNext.has(firstKey)) {
      const previousKey = previousByNext.get(firstKey);

      if (
        !previousKey ||
        precedingKeys.has(previousKey) ||
        !graph.executionsByKey.has(previousKey)
      ) {
        break;
      }

      firstKey = previousKey;
      precedingKeys.add(firstKey);
    }

    const runKeys: ExecutionKey[] = [];
    const seenRunKeys = new Set<ExecutionKey>();
    let currentKey: ExecutionKey | undefined = firstKey;

    while (currentKey && !seenRunKeys.has(currentKey)) {
      if (!graph.executionsByKey.has(currentKey)) {
        break;
      }

      seenRunKeys.add(currentKey);
      runKeys.push(currentKey);
      currentKey = nextByPrevious.get(currentKey);
    }

    // Claim the whole chain before projecting children so cycles cannot nest a run inside itself.
    for (const runKey of runKeys) {
      projectedExecutions.add(runKey);
    }

    return {
      workflowKey: start.workflowKey,
      executions: runKeys.map((runKey) => {
        const execution = graph.executionsByKey.get(runKey);

        if (!execution) {
          throw new Error(`Missing execution in workflow scene: ${runKey}`);
        }

        const executionRows = rowsByExecution.get(runKey) ?? [];
        const children: ChildWorkflowEntry[] = [];

        for (const relation of childrenByParent.get(runKey) ?? []) {
          const workflow = buildWorkflow(
            getExecutionKey(relation.childExecutionIdentity),
          );

          if (!workflow) {
            continue;
          }

          children.push({
            kind: 'child-workflow',
            initiatedEventKey: relation.initiatedEventKey,
            initiatedEventId: relation.initiatedEventId,
            workflow,
          });
        }

        return {
          execution,
          rowCount: executionRows.length,
          childCount: children.length,
          entries: orderExecutionEntries(executionRows, children),
        };
      }),
    };
  }

  return buildWorkflow(rootExecutionKey);
}
