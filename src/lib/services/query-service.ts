import { passAccessToken as codecPassAccessToken } from '$lib/stores/data-encoder-config';
import type { WorkflowRouteParameters } from '$lib/types/api';
import type { Eventual, Settings } from '$lib/types/global';
import {
  convertPayloadToJsonWithCodec,
  convertPayloadToJsonWithWebsocket,
} from '$lib/utilities/decode-payload';
import {
  getCodecEndpoint,
  getCodecPassAccessToken,
} from '$lib/utilities/get-codec';
import { getQueryTypesFromError } from '$lib/utilities/get-query-types-from-error';
import { has } from '$lib/utilities/has';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';
import {
  isTemporalAPIError,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

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
  const route = routeForApi('query', parameters);

  return await requestFromAPI<QueryResponse>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
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
  settings: Settings,
  accessToken: string,
  request = fetch,
): Promise<ParsedQuery> {
  return fetchQuery(options, request).then(async (execution) => {
    const { queryResult } = execution ?? { queryResult: { payloads: [] } };

    let data: ParsedQuery = queryResult.payloads;
    try {
      if (data[0]) {
        const endpoint = getCodecEndpoint(settings);
        const passAccessToken = getCodecPassAccessToken(
          settings,
          codecPassAccessToken,
        );
        const _settings = {
          ...settings,
          codec: { ...settings?.codec, endpoint, passAccessToken },
        };
        const convertedAttributes = endpoint
          ? await convertPayloadToJsonWithCodec({
              attributes: queryResult,
              namespace: options.namespace,
              settings: _settings,
              accessToken,
            })
          : await convertPayloadToJsonWithWebsocket(queryResult);

        if (
          has(convertedAttributes, 'payloads') &&
          Array.isArray(convertedAttributes.payloads)
        ) {
          data = convertedAttributes.payloads[0];
        }
      }

      return parseWithBigInt(data);
    } catch (e) {
      if (typeof data !== 'string') {
        return stringifyWithBigInt(data);
      }

      return data;
    }
  });
}

export async function getWorkflowStackTrace(
  options: WorkflowParameters,
  settings: Settings,
  accessToken: string,
): Promise<ParsedQuery> {
  return getQuery(
    { ...options, queryType: '__stack_trace' },
    settings,
    accessToken,
  );
}
