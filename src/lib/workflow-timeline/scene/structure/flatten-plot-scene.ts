import type { ExecutionScene, WorkflowScene } from './types';
import type { ExecutionKey } from '../../data/identity-keys';
import type { TimelineEventRow } from '../timeline-rows/types';

/** One execution box in the plot, including its parent when nested. */
export type PlotExecutionRow = Readonly<{
  kind: 'execution';
  key: string;
  depth: number;
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

/** Space before a bordered group, retained in the flattened layout for virtualization. */
export type PlotGapRow = Readonly<{
  kind: 'gap';
  key: string;
  depth: number;
}>;

/** Visible execution, event, or spacer row in plot order. */
export type FlattenedPlotSceneRow =
  | PlotExecutionRow
  | PlotEventRow
  | PlotGapRow;

/** Projects a workflow scene into visible plot rows without changing the scene. */
export function flattenPlotScene(
  root: WorkflowScene,
): readonly FlattenedPlotSceneRow[] {
  const flattened: FlattenedPlotSceneRow[] = [];

  function visitExecution(execution: ExecutionScene, depth: number): void {
    const executionKey = execution.execution.executionKey;
    flattened.push({
      kind: 'gap',
      key: `gap:execution:${executionKey}`,
      depth,
    });
    flattened.push({
      kind: 'execution',
      key: `execution:${executionKey}`,
      depth,
      execution,
    });

    for (const entry of execution.entries) {
      if (entry.kind === 'row') {
        if (entry.row.kind === 'workflow') continue;
        flattened.push({
          kind: 'event',
          key: `row:${entry.row.rowKey}`,
          depth: depth + 1,
          executionKey,
          row: entry.row,
        });
        continue;
      }

      for (const childExecution of entry.workflow.executions) {
        visitExecution(childExecution, depth + 1);
      }
    }
  }

  for (const execution of root.executions) {
    visitExecution(execution, 0);
  }

  return flattened;
}
