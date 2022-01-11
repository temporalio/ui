import {
  isTemporalAPIError,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { WorkflowRouteParameters } from '$lib/utilities/route-for-api';
import { getQueryTypesFromError } from '$lib/utilities/get-query-types-from-error';

type QueryRequestParameters = {
  workflow: Eventual<{ id: string; runId: string }>;
  namespace: string;
  queryType: string;
};

type WorkflowParameters = Omit<QueryRequestParameters, 'queryType'>;

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

type ParsedQuery = ReturnType<typeof JSON.parse>[0];

const formatParameters = async (
  namespace: string,
  workflow: Eventual<{ id: string; runId: string }>,
): Promise<WorkflowRouteParameters> => {
  workflow = await workflow;
  return {
    namespace,
    executionId: workflow.id,
    runId: workflow.runId,
  };
};

async function fetchQuery(
  { workflow, namespace, queryType }: QueryRequestParameters,
  request = fetch,
  onError?: (error: {
    status: number;
    statusText: string;
    body: unknown;
  }) => void,
): Promise<QueryResponse> {
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
    request,
    onError,
  });
}

export async function getQueryTypes(
  options: WorkflowParameters,
  request = fetch,
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fetchQuery(
      { ...options, queryType: '@@temporal-internal__list' },
      request,
      ({ body }) => {
        if (isTemporalAPIError(body)) {
          resolve(getQueryTypesFromError(body.message));
        }
      },
    );
  });
}

export async function getQuery(
  options: QueryRequestParameters,
  request = fetch,
): Promise<ParsedQuery> {
  return fetchQuery(options, request).then((execution) => {
    const { queryResult } = execution;
    const data = window.atob(queryResult.payloads[0].data);

    return JSON.parse(data);
  });
}

export async function getWorkflowStackTrace(
  options: WorkflowParameters,
  request = fetch,
): Promise<ParsedQuery> {
  return getQuery({ ...options, queryType: '__stack_trace' }, request);
}
