import { get } from 'svelte/store';

import { v4 } from 'uuid';

import { translate } from '$lib/i18n/translate';
import type { ResetReapplyType } from '$lib/models/workflow-actions';
import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';
import { convertPayloadsWithCodec } from '$lib/services/data-encoder';
import {
  lastDataEncoderError,
  lastDataEncoderStatus,
} from '$lib/stores/data-encoder-config';
import type { ResetWorkflowRequest } from '$lib/types';
import type {
  ValidWorkflowEndpoints,
  ValidWorkflowParameters,
} from '$lib/types/api';
import type {
  NamespaceScopedRequest,
  NetworkError,
  Replace,
  Settings,
} from '$lib/types/global';
import type {
  ArchiveFilterParameters,
  ListWorkflowExecutionsResponse,
  WorkflowExecution,
} from '$lib/types/workflows';
import { btoa } from '$lib/utilities/btoa';
import {
  handleUnauthorizedOrForbiddenError,
  isForbidden,
  isUnauthorized,
} from '$lib/utilities/handle-error';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { base, pathForApi, routeForApi } from '$lib/utilities/route-for-api';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  workflowId: string;
  runId: string;
};

export type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageToken: string;
  error?: string;
};

type CancelWorkflowOptions = {
  namespace: string;
  workflowId: string;
  runId: string;
};

type SignalWorkflowOptions = {
  namespace: string;
  workflowId: string;
  runId: string;
  signalName: string;
  signalInput: string;
  settings: Settings;
  accessToken: string;
};

type TerminateWorkflowOptions = {
  workflow: WorkflowExecution;
  namespace: string;
  reason: string;
  identity?: string;
};

export type ResetWorkflowOptions = {
  namespace: string;
  workflowId: string;
  runId: string;
  eventId: string;
  reason: string;
  resetReapplyType: ResetReapplyType;
};

export type FetchWorkflow =
  | typeof fetchAllWorkflows
  | typeof fetchAllArchivedWorkflows;

export const fetchAllWorkflows = async (
  namespace: string,
  parameters: ValidWorkflowParameters,
  request = fetch,
  archived = false,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const rawQuery =
    parameters.query || toListWorkflowQuery(parameters, archived);
  let query: string;
  try {
    query = decodeURIComponent(rawQuery);
  } catch {
    query = rawQuery;
  }

  const endpoint: ValidWorkflowEndpoints = archived
    ? 'workflows.archived'
    : 'workflows';

  let error = '';
  const onError: ErrorCallback = (err) => {
    // Kick out to login if 401/403
    handleUnauthorizedOrForbiddenError(err);
    if (err?.body?.message || err?.status) {
      error =
        err?.body?.message ??
        `Error fetching workflows: ${err.status}: ${err.statusText}`;
    } else {
      error = 'Error fetching workflows: Server failed to respond';
    }
  };

  const route = routeForApi(endpoint, { namespace });
  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(route, {
      params: { query },
      onError,
      handleError: onError,
      request,
    })) ?? { executions: [], nextPageToken: '' };

  return {
    workflows: toWorkflowExecutions({ executions }),
    nextPageToken: String(nextPageToken),
    error,
  };
};

type WorkflowForRunIdParams = {
  namespace: string;
  workflowId: string;
  url?: string;
};

export const fetchWorkflowForRunId = async (
  { namespace, workflowId, url }: WorkflowForRunIdParams,
  request = fetch,
): Promise<{ runId: string }> => {
  const endpoint: ValidWorkflowEndpoints = 'workflows';
  const baseUrl = url ?? base(namespace);
  const path = pathForApi(endpoint, { namespace });
  const route = baseUrl + path;
  const { executions } = (await requestFromAPI<ListWorkflowExecutionsResponse>(
    route,
    {
      params: {
        query: `WorkflowId="${workflowId}"`,
        pageSize: '1',
      },
      request,
    },
  )) ?? { executions: [] };
  const latestExecution = toWorkflowExecutions({ executions })?.[0];

  return {
    runId: latestExecution?.runId,
  };
};

export const fetchWorkflowForAuthorization = async (
  namespace: string,
  request = fetch,
  archived = false,
): Promise<{ authorized: boolean }> => {
  const endpoint: ValidWorkflowEndpoints = archived
    ? 'workflows.archived'
    : 'workflows';

  let authorized = true;
  const onError: ErrorCallback = (err) => {
    if (isUnauthorized(err) || isForbidden(err)) {
      authorized = false;
    }
  };

  const route = routeForApi(endpoint, { namespace });
  await requestFromAPI<ListWorkflowExecutionsResponse>(route, {
    params: { pageSize: '1' },
    onError,
    handleError: onError,
    request,
  });

  return {
    authorized,
  };
};

export const fetchAllArchivedWorkflows = async (
  namespace: string,
  parameters: ArchiveFilterParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  return fetchAllWorkflows(namespace, parameters, request, true);
};

export async function fetchWorkflow(
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<{
  workflow?: WorkflowExecution;
  error?: NetworkError;
}> {
  const route = routeForApi('workflow', {
    namespace: parameters.namespace,
    workflowId: parameters.workflowId,
  });

  return requestFromAPI(route, {
    request,
    notifyOnError: false,
    params: {
      'execution.runId': parameters.runId,
    },
  })
    .then((response) => {
      return { workflow: toWorkflowExecution(response) };
    })
    .catch((e: NetworkError) => {
      return { error: e };
    });
}

export async function terminateWorkflow({
  workflow,
  namespace,
  reason,
  identity,
}: TerminateWorkflowOptions): Promise<null> {
  const route = routeForApi('workflow.terminate', {
    namespace,
    workflowId: workflow.id,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({ reason, ...(identity && { identity }) }),
    },
    notifyOnError: false,
    params: {
      'execution.runId': workflow.runId,
    },
  });
}

export async function cancelWorkflow(
  { namespace, workflowId, runId }: CancelWorkflowOptions,
  request = fetch,
) {
  const route = routeForApi('workflow.cancel', {
    namespace,
    workflowId,
  });

  return requestFromAPI(route, {
    request,
    notifyOnError: false,
    options: {
      method: 'POST',
    },
    params: {
      'execution.runId': runId,
    },
  });
}

export async function signalWorkflow({
  namespace,
  workflowId,
  runId,
  signalName,
  signalInput,
  settings,
  accessToken,
}: SignalWorkflowOptions) {
  const route = routeForApi('workflow.signal', {
    namespace,
    workflowId,
    signalName,
  });

  let payloads = null;

  if (signalInput) {
    if (settings?.codec?.endpoint) {
      const awaitData = await convertPayloadsWithCodec({
        payloads: { payloads: [JSON.parse(signalInput)] },
        namespace,
        settings,
        accessToken,
        encode: true,
      });
      if (get(lastDataEncoderStatus) === 'error') {
        throw new Error(
          get(lastDataEncoderError) || translate('common.encode-failed'),
        );
      }
      payloads = awaitData?.payloads ?? null;
    } else {
      payloads = [
        {
          metadata: {
            encoding: btoa('json/plain'),
          },
          data: btoa(signalInput),
        },
      ];
    }
  }

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        signalName,
        input: {
          payloads,
        },
        params: {
          'execution.runId': runId,
        },
      }),
    },
  });
}

export async function resetWorkflow({
  namespace,
  workflowId,
  runId,
  eventId,
  reason,
  resetReapplyType,
}: ResetWorkflowOptions): Promise<{ runId: string }> {
  const route = routeForApi('workflow.reset', {
    namespace,
    workflowId,
  });

  const body: Replace<
    ResetWorkflowRequest,
    { workflowTaskFinishEventId: string; resetReapplyType: ResetReapplyType }
  > = {
    workflowExecution: {
      workflowId,
      runId,
    },
    workflowTaskFinishEventId: eventId,
    resetReapplyType,
    requestId: v4(),
    reason,
  };

  return requestFromAPI<{ runId: string }>(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
    },
    params: {
      'execution.runId': runId,
    },
  });
}

export async function fetchWorkflowForSchedule(
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  const onError: ErrorCallback = (err) => {
    console.error(err);
  };

  const route = routeForApi('workflow', parameters);
  return requestFromAPI(route, {
    request,
    onError,
    handleError: onError,
  }).then(toWorkflowExecution);
}
