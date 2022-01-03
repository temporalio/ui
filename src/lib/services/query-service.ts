import type { WorkflowExecution } from '$lib/models/workflow-execution';
import { requestFromAPI } from '$lib/utilities/request-from-api';

type StackTraceOptions = {
  workflow: WorkflowExecution;
  namespace: string;
};

type QueryPayload = {
  data: string;
  metadata: {
    encoding?: string;
  };
};

type QueryType = {
  payloads: QueryPayload[];
};

type StackTraceExecution = {
  queryRejected?: null;
  queryResult: QueryType;
};

export async function getWorkflowStackTrace({
  workflow,
  namespace,
}: StackTraceOptions): Promise<StackTraceExecution> {
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
