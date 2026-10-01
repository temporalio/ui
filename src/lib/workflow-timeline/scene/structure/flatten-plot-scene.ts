import type { ExecutionScene, WorkflowScene } from './types';
import type { ExecutionKey } from '../../data/identity-keys';
import type { TimelineEventRow } from '../timeline-rows/types';

/** One execution box in the plot, including its parent when nested. */
export type PlotExecutionRow = Readonly<{
  kind: 'execution';
  key: string;
  depth: number;
  continuesAsNew: boolean;
  runNumber: number;
  runCount: number;
  execution: ExecutionScene;
}>;

/** One lifecycle row owned by an execution box. */
export type PlotEventRow = Readonly<{
  kind: 'event';
  key: string;
  depth: number;
  executionKey: ExecutionKey;
  row: TimelineEventRow;
}>;

/** Child workflow header, visible even when its runs are collapsed. */
export type PlotChildRow = Readonly<{
  kind: 'child';
  key: string;
  depth: number;
  workflow: WorkflowScene;
}>;

export type PlotWorkflowRow = Readonly<{
  kind: 'workflow';
  key: string;
  depth: number;
  workflow: WorkflowScene;
}>;

/** Visible workflow, execution, or event row in plot order. */
export type FlattenedPlotSceneRow =
  | PlotWorkflowRow
  | PlotChildRow
  | PlotExecutionRow
  | PlotEventRow;

/** Projects a workflow scene into visible plot rows without changing the scene. */
export function flattenPlotScene(
  root: WorkflowScene,
  isChildCollapsed: (key: string) => boolean,
  isExecutionCollapsed: (key: string) => boolean,
): readonly FlattenedPlotSceneRow[] {
  const flattened: FlattenedPlotSceneRow[] = [];

  function visitExecution(
    execution: ExecutionScene,
    depth: number,
    continuesAsNew: boolean,
    runNumber: number,
    runCount: number,
  ): void {
    const executionKey = execution.execution.executionKey;

    flattened.push({
      kind: 'execution',
      key: `execution:${executionKey}`,
      depth,
      continuesAsNew,
      runNumber,
      runCount,
      execution,
    });

    if (isExecutionCollapsed(`execution:${executionKey}`)) return;

    for (const entry of execution.entries) {
      if (entry.kind === 'row') {
        flattened.push({
          kind: 'event',
          key: `row:${entry.row.rowKey}`,
          depth: depth + 1,
          executionKey,
          row: entry.row,
        });
        continue;
      }

      const key = `child:${entry.initiatedEventKey}`;
      flattened.push({
        kind: 'child',
        key,
        depth: depth + 1,
        workflow: entry.workflow,
      });
      if (isChildCollapsed(key)) continue;

      entry.workflow.executions.forEach((childExecution, index) => {
        visitExecution(
          childExecution,
          depth + 2,
          index < entry.workflow.executions.length - 1,
          index + 1,
          entry.workflow.executions.length,
        );
      });
    }
  }

  const workflowKey = `workflow:${root.workflowKey}`;
  flattened.push({
    kind: 'workflow',
    key: workflowKey,
    depth: 0,
    workflow: root,
  });

  if (isChildCollapsed(workflowKey)) return flattened;

  root.executions.forEach((execution, index) => {
    visitExecution(
      execution,
      1,
      index < root.executions.length - 1,
      index + 1,
      root.executions.length,
    );
  });

  return flattened;
}
