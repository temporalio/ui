import type { WorkflowExecution } from '$lib/models/workflow-execution';
import { requestFromAPI } from '$lib/utilities/request-from-api';

type TerminateWorkflowOptions = {
  workflow: WorkflowExecution;
  namespace: string;
  reason: string;
};

export async function terminateWorkflow({
  workflow,
  namespace,
  reason,
}: TerminateWorkflowOptions): Promise<any> {
  return await requestFromAPI<any>(
    `/namespaces/${namespace}/workflows/${workflow.id}/executions/${workflow.runId}:terminate`,
    {
      options: { method: 'POST', body: JSON.stringify({ reason }) },
      shouldRetry: false,
    },
  );
}
