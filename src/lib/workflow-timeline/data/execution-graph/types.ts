import type {
  EventKey,
  ExecutionIdentity,
  ExecutionKey,
  WorkflowKey,
} from '../identity-keys';

/** Links an execution to the next execution in its continue-as-new chain. */
export type ContinueAsNewRelation = Readonly<{
  kind: 'continue-as-new';
  previousExecutionKey: ExecutionKey;
  nextExecutionIdentity: ExecutionIdentity;
  continuedAsNewEventKey: EventKey;
}>;

/** Links a parent execution to a started child workflow execution. */
export type ChildWorkflowRelation = Readonly<{
  kind: 'child-workflow';
  parentExecutionKey: ExecutionKey;
  childExecutionIdentity: ExecutionIdentity;
  initiatedEventId: string;
  initiatedEventKey: EventKey;
  startedEventKey: EventKey;
}>;

/** A discovered relationship between workflow executions. */
export type ExecutionRelation = ContinueAsNewRelation | ChildWorkflowRelation;

/** A workflow execution registered in the execution graph. */
export type ExecutionNode = Readonly<{
  executionKey: ExecutionKey;
  workflowKey: WorkflowKey;
  identity: ExecutionIdentity;
}>;

/** A point-in-time execution graph snapshot. */
export type ExecutionGraphSnapshot = Readonly<{
  executionsByKey: ReadonlyMap<ExecutionKey, ExecutionNode>;
  relations: readonly ExecutionRelation[];
}>;

/** Notifies subscribers that the execution graph gained nodes or relations. */
export type ExecutionGraphUpdatedNotification = Readonly<{
  type: 'EXECUTION_GRAPH_UPDATED';
  executions: readonly ExecutionNode[];
  relations: readonly ExecutionRelation[];
}>;

/** Provides a subscriber with the current execution graph. */
export type ExecutionGraphSnapshotNotification = Readonly<{
  type: 'EXECUTION_GRAPH_SNAPSHOT';
  graph: ExecutionGraphSnapshot;
}>;

/** A notification published by an execution graph repository. */
export type ExecutionGraphRepositoryNotification =
  | ExecutionGraphSnapshotNotification
  | ExecutionGraphUpdatedNotification;

/** Receives notifications from an execution graph repository. */
export type ExecutionGraphRepositorySubscriber = (
  notification: ExecutionGraphRepositoryNotification,
) => void;
