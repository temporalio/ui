import sanitize from 'sanitize-html';

import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { WorkflowExecution } from '$lib/models/workflow-execution';
import type { WorkflowRouteParameters } from '$lib/utilities/route-for-api';

type QueryRequestParameters = {
  workflow: Eventual<WorkflowExecution>;
  namespace: string;
  queryType: string;
};

type StackTraceOptions = Omit<QueryRequestParameters, 'queryType'>;

type QueryPayload = {
  data: string;
  metadata: {
    encoding: string;
  };
};

type QueryType = {
  payloads: QueryPayload[];
};

type QueryResponse = {
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

async function fetchQuery({
  workflow,
  namespace,
  queryType,
}: QueryRequestParameters): Promise<QueryResponse> {
  workflow = await workflow;
  const parameters = await formatParameters(namespace, workflow);

  return await requestFromAPI<QueryResponse>(routeForApi('query', parameters), {
    options: {
      method: 'POST',
      body: JSON.stringify({
        execution: {
          workflowId: workflow.id,
          runId: workflow.runId,
        },
        query: {
          queryType,
        },
      }),
    },
  });
}

export async function getQuery(
  options: QueryRequestParameters,
): Promise<string> {
  return fetchQuery(options).then((execution) => {
    const { queryResult } = execution;
    return window.atob(queryResult.payloads[0].data);
  });
}

export async function getWorkflowStackTrace(
  options: StackTraceOptions,
): Promise<string> {
  return getQuery({ ...options, queryType: '__stack_trace' }).then(
    formatStackTrace,
  );
}
