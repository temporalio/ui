import {
  isTemporalAPIError,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { getQueryTypesFromError } from '$lib/utilities/get-query-types-from-error';
import { atob } from '$lib/utilities/atob';

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
} & Response;

export type ParsedQuery = ReturnType<typeof JSON.parse>[0];

const formatParameters = async (
  namespace: string,
  workflow: Eventual<{ id: string; runId: string }>,
): Promise<WorkflowRouteParameters> => {
  workflow = await workflow;
  return {
    namespace,
    workflowId: workflow.id,
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
    notifyOnError: false,
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
      (response) => {
        if (
          isTemporalAPIError(response.body) &&
          response.body.message.includes('@@temporal-internal__list')
        ) {
          resolve(getQueryTypesFromError(response.body.message));
        } else {
          reject(response);
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
    const { queryResult } = execution ?? { queryResult: { payloads: [] } };

    let data: ParsedQuery = queryResult.payloads;

    try {
      if (data[0]) {
        data = atob(queryResult.payloads[0].data);
      }

      return JSON.parse(data);
    } catch {
      if (typeof data !== 'string') {
        return JSON.stringify(data);
      }

      return data;
    }
  });
}

export async function getWorkflowStackTrace(
  options: WorkflowParameters,
  request = fetch,
): Promise<ParsedQuery> {
  return getQuery({ ...options, queryType: '__stack_trace' }, request);
}
