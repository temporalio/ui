import type { ErrorCallback } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';

import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
import {
  handleUnauthorizedOrForbiddenError,
  isForbidden,
  isUnauthorized,
} from '$lib/utilities/handle-error';
import { noop } from 'svelte/internal';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { btoa } from '$lib/utilities/btoa';

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
};

type TerminateWorkflowOptions = {
  workflow: WorkflowExecution;
  namespace: string;
  reason: string;
};

export type FetchWorkflow =
  | typeof fetchAllWorkflows
  | typeof fetchAllArchivedWorkflows;

export const fetchWorkflowCount = async (
  namespace: string,
  query: string,
  request = fetch,
): Promise<{ totalCount: number; count: number }> => {
  let totalCount = 0;
  let count = 0;
  try {
    const countRoute = await routeForApi('workflows.count', { namespace });
    if (!query) {
      const totalCountResult = await requestFromAPI<{ count: number }>(
        countRoute,
        {
          params: {},
          onError: noop,
          handleError: noop,
          request,
        },
      );
      totalCount = totalCountResult?.count;
    } else {
      const countPromise = requestFromAPI<{ count: number }>(countRoute, {
        params: { query },
        onError: noop,
        handleError: noop,
        request,
      });
      const totalCountPromise = requestFromAPI<{ count: number }>(countRoute, {
        params: { query: '' },
        onError: noop,
        handleError: noop,
        request,
      });
      const [countResult, totalCountResult] = await Promise.all([
        countPromise,
        totalCountPromise,
      ]);
      count = countResult?.count;
      totalCount = totalCountResult?.count;
    }
  } catch (e) {
    // Don't fail the workflows call due to count
  }

  return { count, totalCount };
};

export const fetchStatusesWorkflowCount = async (
  namespace: string,
  request = fetch,
): Promise<{
  runningCount: number;
  failedCount: number;
  timedOutCount: number;
  terminatedCount: number;
  canceledCount: number;
  completedCount: number;
}> => {
  let runningCount = 0;
  let failedCount = 0;
  let terminatedCount = 0;
  let timedOutCount = 0;
  let canceledCount = 0;
  let completedCount = 0;

  try {
    const countRoute = await routeForApi('workflows.count', { namespace });
    const statusPromise = (status: WorkflowStatus) =>
      requestFromAPI<{ count: number }>(countRoute, {
        params: { query: `ExecutionStatus="${status}"` },
        onError: noop,
        handleError: noop,
        request,
      });

    const [
      runningResult,
      failedResult,
      terminatedResult,
      timedOutResult,
      canceledResult,
      completedResult,
    ] = await Promise.all([
      statusPromise('Running'),
      statusPromise('Failed'),
      statusPromise('Terminated'),
      statusPromise('TimedOut'),
      statusPromise('Canceled'),
      statusPromise('Completed'),
    ]);
    runningCount = runningResult?.count;
    failedCount = failedResult?.count;
    terminatedCount = terminatedResult?.count;
    timedOutCount = timedOutResult?.count;
    canceledCount = canceledResult?.count;
    completedCount = completedResult?.count;
  } catch (e) {
    // Don't fail the workflows call due to count
  }

  return {
    runningCount,
    failedCount,
    terminatedCount,
    timedOutCount,
    canceledCount,
    completedCount,
  };
};

export const fetchStatusWorkflowCount = async (
  namespace: string,
  status: WorkflowStatus,
  request = fetch,
): Promise<number> => {
  let count = 0;
  try {
    const countRoute = await routeForApi('workflows.count', { namespace });
    const statusPromise = (status: WorkflowStatus) =>
      requestFromAPI<{ count: number }>(countRoute, {
        params: { query: `ExecutionStatus="${status}"` },
        onError: noop,
        handleError: noop,
        request,
      });

    const result = await statusPromise(status);
    count = result?.count;
  } catch (e) {
    // Don't fail the workflows call due to count
  }

  return count;
};


export const fetchPaginatedWorkflows = async (
  namespace: string,
  parameters: ValidWorkflowParameters,
  token: NextPageToken,
  pageSize: string,
  request = fetch,
  archived = false,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const query = decodeURIComponent(
    parameters.query || toListWorkflowQuery(parameters, archived),
  );

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
      error = `Error fetching workflows: Server failed to respond`;
    }
  };

  const route = await routeForApi(endpoint, { namespace });
  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(route, {
      params: { query, pageSize },
      token,
      onError,
      handleError: onError,
      request,
    })) ?? { executions: [], nextPageToken: '' };

  return {
    workflows: toWorkflowExecutions({ executions }),
    nextPageToken: nextPageToken ? String(nextPageToken) : '',
    error,
  };
};

export const fetchAllWorkflows = async (
  namespace: string,
  parameters: ValidWorkflowParameters,
  request = fetch,
  archived = false,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const query = decodeURIComponent(
    parameters.query || toListWorkflowQuery(parameters, archived),
  );

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
      error = `Error fetching workflows: Server failed to respond`;
    }
  };

  const route = await routeForApi(endpoint, { namespace });
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

  const route = await routeForApi(endpoint, { namespace });
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
): Promise<WorkflowExecution> {
  const route = await routeForApi('workflow', parameters);
  return requestFromAPI(route, { request }).then(toWorkflowExecution);
}

export async function terminateWorkflow({
  workflow,
  namespace,
  reason,
}: TerminateWorkflowOptions): Promise<null> {
  const route = await routeForApi('workflow.terminate', {
    namespace,
    workflowId: workflow.id,
    runId: workflow.runId,
  });
  return await requestFromAPI<null>(route, {
    options: { method: 'POST', body: stringifyWithBigInt({ reason }) },
    shouldRetry: false,
    notifyOnError: false,
  });
}

export async function cancelWorkflow(
  { namespace, workflowId, runId }: CancelWorkflowOptions,
  request = fetch,
) {
  const route = await routeForApi('workflow.cancel', {
    namespace,
    workflowId,
    runId,
  });

  return requestFromAPI(route, {
    request,
    notifyOnError: false,
    options: {
      method: 'POST',
    },
  });
}

export async function signalWorkflow({
  namespace,
  workflowId,
  runId,
  signalName,
  signalInput,
}: SignalWorkflowOptions) {
  const route = await routeForApi('workflow.signal', {
    namespace,
    workflowId,
    runId,
  });

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        signalName,
        input: {
          payloads: signalInput
            ? [
              {
                metadata: {
                  encoding: btoa('json/plain'),
                },
                data: btoa(stringifyWithBigInt(signalInput)),
              },
            ]
            : null,
        },
      }),
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

  const route = await routeForApi('workflow', parameters);
  return requestFromAPI(route, {
    request,
    onError,
    handleError: onError,
  }).then(toWorkflowExecution);
}
