import { fetchWorkflow } from '$lib/services/workflow-service';

export async function get({ params }): Promise<RequestOutput> {
  const { workflow: executionId, run: runId, namespace } = params;

  const parameters = {
    namespace,
    executionId,
    runId,
  };

  const workflow = await fetchWorkflow(parameters, fetch);

  return {
    body: { workflow, namespace },
  };
}
