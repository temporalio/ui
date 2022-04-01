import { requestFromAPI } from '$lib/utilities/request-from-api';
import { ApiRoutes } from '$lib/utilities/route-for-api';

type TerminateWorkflowOptions = {
  workflow: WorkflowExecution;
  namespace: string;
  reason: string;
};

export async function terminateWorkflow({
  workflow,
  namespace,
  reason,
}: TerminateWorkflowOptions): Promise<null> {
  return await requestFromAPI<null>(
    ApiRoutes['workflow.terminate']({
      namespace,
      workflowId: workflow.id,
      runId: workflow.runId,
    }),
    {
      options: { method: 'POST', body: JSON.stringify({ reason }) },
      shouldRetry: false,
    },
  );
}
