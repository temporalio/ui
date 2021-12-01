import type { WorkflowExecution } from '$lib/models/workflow-execution';

type WorkflowIdentifier = Pick<WorkflowExecution, 'id' | 'runId'>;

export const getWorkflowExecutionUrl = (
  namespace: string,
  workflow: WorkflowIdentifier,
): string => {
  if (!workflow) return;
  return `/namespaces/${namespace}/workflows/${workflow.id}/${workflow.runId}`;
};
