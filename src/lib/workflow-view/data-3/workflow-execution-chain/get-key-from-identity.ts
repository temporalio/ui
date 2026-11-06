import type {
  WorkflowExecutionChainIdentity,
  WorkflowExecutionChainKey,
} from './types';

export function getWorkflowExecutionChainKeyFromIdentity(
  identity: WorkflowExecutionChainIdentity,
): WorkflowExecutionChainKey {
  return `workflow-execution-chain:(${JSON.stringify({
    namespace: identity.namespace,
    workflowId: identity.workflowId,
    firstRunId: identity.firstRunId,
  })})`;
}
