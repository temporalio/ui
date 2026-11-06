import type { WorkflowExecution } from '../workflow-execution/workflow-execution';

export type WorkflowExecutionChainIdentity = Readonly<{
  namespace: string;
  workflowId: string;
  firstRunId: string;
}>;

export type WorkflowExecutionChainKey = `workflow-execution-chain:(${string})`;

/** The known executions belonging to one workflow execution chain. */
export type WorkflowExecutionChain = Readonly<{
  identity: WorkflowExecutionChainIdentity;
  executions: readonly WorkflowExecution[];
}>;
