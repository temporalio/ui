import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

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
  const route = await routeForApi('workflow.terminate', {
    namespace,
    workflowId: workflow.id,
    runId: workflow.runId,
  });
  return await requestFromAPI<null>(
    route,
    {
      options: { method: 'POST', body: JSON.stringify({ reason }) },
      shouldRetry: false,
      notifyOnError: false,
    },
  );
}
