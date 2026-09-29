import type { FlattenedSceneRow, WorkflowScene } from './types';
import type { ExecutionKey } from '../../data/identity-keys';

/** Flattens a nested workflow scene into ordered, keyed rows with nesting depth. */
export function flattenWorkflowScene(
  root: WorkflowScene,
  rootExecutionKey: ExecutionKey,
): readonly FlattenedSceneRow[] {
  const flattened: FlattenedSceneRow[] = [];

  function visitWorkflow(
    workflow: WorkflowScene,
    key: string,
    depth: number,
    workflowDepth: number,
    initiatedEventId: string | null,
  ): void {
    flattened.push({
      kind: 'workflow',
      key,
      depth,
      workflowDepth,
      workflow,
      initiatedEventId,
    });

    const hasMultipleExecutions = workflow.executions.length > 1;
    const entryDepth = depth + (hasMultipleExecutions ? 2 : 1);

    for (const execution of workflow.executions) {
      const executionKey = execution.execution.executionKey;
      if (hasMultipleExecutions) {
        flattened.push({
          kind: 'execution',
          key: `execution:${executionKey}`,
          depth: depth + 1,
          workflowDepth,
          execution,
        });
      }

      for (const entry of execution.entries) {
        if (entry.kind === 'row') {
          flattened.push({
            kind: 'event',
            key: `row:${entry.row.rowKey}`,
            depth: entryDepth,
            workflowDepth,
            executionKey,
            row: entry.row,
          });
        } else {
          visitWorkflow(
            entry.workflow,
            `child:${entry.initiatedEventKey}`,
            entryDepth,
            workflowDepth + 1,
            entry.initiatedEventId,
          );
        }
      }
    }
  }

  visitWorkflow(root, `root:${rootExecutionKey}`, 0, 0, null);
  return flattened;
}
