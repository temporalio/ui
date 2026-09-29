import type { ExecutionNode } from '../../data/execution-graph/types';
import type {
  EventKey,
  ExecutionKey,
  WorkflowKey,
} from '../../data/identity-keys';
import type { TimelineEventRow } from '../timeline-rows/types';

/** One lifecycle row within an execution's ordered scene. */
export type ExecutionRowEntry = Readonly<{
  kind: 'row';
  row: TimelineEventRow;
}>;

/** A child workflow placed at its initiating event in the parent execution. */
export type ChildWorkflowEntry = Readonly<{
  kind: 'child-workflow';
  initiatedEventKey: EventKey;
  initiatedEventId: string;
  workflow: WorkflowScene;
}>;

/** One ordered item within an execution's scene. */
export type ExecutionSceneEntry = ExecutionRowEntry | ChildWorkflowEntry;

/** One execution with ordered lifecycle rows and child workflows. */
export type ExecutionScene = Readonly<{
  execution: ExecutionNode;
  rowCount: number;
  childCount: number;
  entries: readonly ExecutionSceneEntry[];
}>;

/** One logical workflow containing its ordered runs. */
export type WorkflowScene = Readonly<{
  workflowKey: WorkflowKey;
  executions: readonly ExecutionScene[];
}>;

/** A flattened workflow header, including a child's parent-event anchor. */
export type WorkflowSceneRow = Readonly<{
  kind: 'workflow';
  key: string;
  depth: number;
  workflowDepth: number;
  workflow: WorkflowScene;
  initiatedEventId: string | null;
}>;

/** A flattened execution header. */
export type ExecutionSceneRow = Readonly<{
  kind: 'execution';
  key: string;
  depth: number;
  workflowDepth: number;
  execution: ExecutionScene;
}>;

/** A flattened lifecycle event row. */
export type EventSceneRow = Readonly<{
  kind: 'event';
  key: string;
  depth: number;
  workflowDepth: number;
  executionKey: ExecutionKey;
  row: TimelineEventRow;
}>;

/** One visible entry in scene order, suitable for vertical windowing. */
export type FlattenedSceneRow =
  | WorkflowSceneRow
  | ExecutionSceneRow
  | EventSceneRow;
