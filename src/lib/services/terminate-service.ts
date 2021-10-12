import { requestFromAPI } from '$lib/utilities/request-from-api';

export async function terminateWorkflow(
  { workflow, namespace }: any,
  request = fetch,
): Promise<any> {
  return await requestFromAPI<any>(
    `/namespaces/${namespace}/workflows/${workflow.id}/executions/${workflow.runId}:terminate`,
    { request: request.POST },
  );
}
