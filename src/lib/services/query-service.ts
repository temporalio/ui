import sanitize from 'sanitize-html';

import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { WorkflowExecution } from '$lib/models/workflow-execution';
import type { WorkflowRouteParameters } from '$lib/utilities/route-for-api';

type StackTraceOptions = {
  workflow: Eventual<WorkflowExecution>;
  namespace: string;
};

type QueryPayload = {
  data: string;
  metadata: {
    encoding: string;
  };
};

type QueryType = {
  payloads: QueryPayload[];
};

type StackTraceExecution = {
  queryRejected: string | null;
  queryResult: QueryType;
};

const formatParameters = async (
  namespace: string,
  workflow: Eventual<WorkflowExecution>,
): Promise<WorkflowRouteParameters> => {
  workflow = await workflow;
  return {
    namespace,
    executionId: workflow.id,
    runId: workflow.runId,
  };
};

const formatStackTrace = (data: string): string => {
  return sanitize(data).slice(1, data.length - 1);
};

export async function getWorkflowStackTrace({
  workflow,
  namespace,
}: StackTraceOptions): Promise<string> {
  workflow = await workflow;
  const parameters = await formatParameters(namespace, workflow);

  return await requestFromAPI<StackTraceExecution>(
    routeForApi('query', parameters),
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
  ).then((execution) => {
    const { queryResult } = execution;
    return formatStackTrace(window.atob(queryResult.payloads[0].data));
  });
}
