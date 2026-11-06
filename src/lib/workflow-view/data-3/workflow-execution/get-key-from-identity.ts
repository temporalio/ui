import type { WorkflowExecutionIdentity, WorkflowExecutionKey } from './types';

export function getWorkflowExecutionKeyFromIdentity(
  identity: WorkflowExecutionIdentity,
): WorkflowExecutionKey {
  return `workflow-execution:(${JSON.stringify({
    namespace: identity.namespace,
    workflowId: identity.workflowId,
    runId: identity.runId,
  })})`;
}
