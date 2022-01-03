import type { WorkflowExecution } from '$lib/models/workflow-execution';
import { requestFromAPI } from '$lib/utilities/request-from-api';

type StackTraceOptions = {
  workflow: WorkflowExecution;
  namespace: string;
};

export async function getWorkflowStackTrace({
  workflow,
  namespace,
}: StackTraceOptions): Promise<null> {
  return await requestFromAPI<null>(
    `/namespaces/${namespace}/workflows/${workflow.id}/executions/${workflow.runId}/query`,
    {
      options: {
        method: 'POST',
        body: JSON.stringify({
          execution: {
            workflowId: workflow.id,
            runId: workflow.runId,
          },
          query: {
            queryType: '__stack_trace',
          },
        }),
      },
      shouldRetry: false,
    },
  );
}
