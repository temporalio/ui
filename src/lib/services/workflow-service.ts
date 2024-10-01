import { get } from 'svelte/store';

import { v4 } from 'uuid';

import { page } from '$app/stores';

import { Action, type ResetReapplyType } from '$lib/models/workflow-actions';
import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';
import { authUser } from '$lib/stores/auth-user';
import type { SearchAttributeInput } from '$lib/stores/search-attributes';
import { canFetchChildWorkflows } from '$lib/stores/workflows';
import type { ResetWorkflowRequest, SearchAttribute } from '$lib/types';
import type {
  ValidWorkflowEndpoints,
  ValidWorkflowParameters,
} from '$lib/types/api';
import type { Payload, WorkflowExecutionStartedEvent } from '$lib/types/events';
import type {
  NamespaceScopedRequest,
  NetworkError,
  Replace,
} from '$lib/types/global';
import type {
  ArchiveFilterParameters,
  ListWorkflowExecutionsResponse,
  WorkflowExecution,
} from '$lib/types/workflows';
import {
  cloneAllPotentialPayloadsWithCodec,
  type PotentiallyDecodable,
} from '$lib/utilities/decode-payload';
import {
  encodePayloads,
  setBase64Payload,
} from '$lib/utilities/encode-payload';
import {
  handleUnauthorizedOrForbiddenError,
  isForbidden,
  isUnauthorized,
} from '$lib/utilities/handle-error';
import { paginated } from '$lib/utilities/paginated';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { base, pathForApi, routeForApi } from '$lib/utilities/route-for-api';
import { isVersionNewer } from '$lib/utilities/version-check';
import { formatReason } from '$lib/utilities/workflow-actions';

import { fetchInitialEvent } from './events-service';

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
  workflow: WorkflowExecution;
};

type SignalWorkflowOptions = {
  namespace: string;
  workflow: WorkflowExecution;
  name: string;
  input: string;
};

type StartWorkflowOptions = {
  namespace: string;
  workflowId: string;
  taskQueue: string;
  workflowType: string;
  input: string;
  searchAttributes: SearchAttributeInput[];
};

type TerminateWorkflowOptions = {
  workflow: WorkflowExecution;
  namespace: string;
  reason: string;
};

export type ResetWorkflowOptions = {
  namespace: string;
  workflow: WorkflowExecution;
  eventId: string;
  reason: string;
  reapplyType: ResetReapplyType;
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
}: TerminateWorkflowOptions): Promise<null> {
  const route = routeForApi('workflow.terminate', {
    namespace,
    workflowId: workflow.id,
  });

  const email = get(authUser).email;
  const formattedReason = formatReason({
    reason,
    action: Action.Terminate,
    email,
  });

  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        reason: formattedReason,
        ...(email && { identity: email }),
      }),
    },
    notifyOnError: false,
    params: {
      'execution.runId': workflow.runId,
    },
  });
}

export async function cancelWorkflow(
  { namespace, workflow: { id: workflowId, runId } }: CancelWorkflowOptions,
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
  workflow: { id: workflowId, runId },
  name,
  input,
}: SignalWorkflowOptions) {
  const route = routeForApi('workflow.signal', {
    namespace,
    workflowId,
    signalName: name,
  });
  const payloads = await encodePayloads(input);
  const settings = get(page).data.settings;
  const version = settings?.version ?? '';
  const newVersion = isVersionNewer(version, '2.22');
  const body = newVersion
    ? {
        signalName: name,
        workflowExecution: {
          workflowId,
          runId,
        },
        input: {
          payloads,
        },
      }
    : {
        signalName: name,
        input: {
          payloads,
        },
        params: {
          'execution.runId': runId,
        },
      };

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
    },
  });
}

export async function resetWorkflow({
  namespace,
  workflow: { id: workflowId, runId },
  eventId,
  reason,
  reapplyType,
}: ResetWorkflowOptions): Promise<{ runId: string }> {
  const route = routeForApi('workflow.reset', {
    namespace,
    workflowId,
  });

  const email = get(authUser).email;
  const formattedReason = formatReason({
    action: Action.Reset,
    reason,
    email,
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
    resetReapplyType: reapplyType,
    requestId: v4(),
    reason: formattedReason,
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

export async function fetchAllChildWorkflows(
  namespace: string,
  workflowId: string,
  runId?: string,
): Promise<WorkflowExecution[]> {
  if (!get(canFetchChildWorkflows)) {
    return [];
  }
  try {
    let query = `ParentWorkflowId = "${workflowId}"`;
    if (runId) {
      query += ` AND ParentRunId = "${runId}"`;
    }
    const { workflows } = await fetchAllWorkflows(namespace, { query });
    return workflows;
  } catch (e) {
    return [];
  }
}

export const setSearchAttributes = (
  attributes: SearchAttributeInput[],
): SearchAttribute => {
  if (!attributes.length) return {};

  const searchAttributes: SearchAttribute = {};
  attributes.forEach((attribute) => {
    searchAttributes[attribute.attribute] = setBase64Payload(attribute.value);
  });

  return searchAttributes;
};

export async function startWorkflow({
  namespace,
  workflowId,
  taskQueue,
  workflowType,
  input,
  searchAttributes,
}: StartWorkflowOptions) {
  const route = routeForApi('workflow', {
    namespace,
    workflowId,
  });
  let payloads;

  if (input) {
    try {
      payloads = await encodePayloads(input);
    } catch (_) {
      console.error('Could not decode input for starting workflow');
    }
  }

  const body = stringifyWithBigInt({
    workflowId,
    taskQueue: {
      name: taskQueue,
    },
    workflowType: {
      name: workflowType,
    },
    input: payloads ? { payloads } : null,
    searchAttributes:
      searchAttributes.length === 0
        ? null
        : {
            indexedFields: {
              ...setSearchAttributes(searchAttributes),
            },
          },
  });

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body,
    },
  });
}

export const fetchInitialValuesForStartWorkflow = async ({
  namespace,
  workflowType,
  workflowId,
}: {
  namespace: string;
  workflowType?: string;
  workflowId?: string;
}): Promise<{
  input: string;
  searchAttributes: Record<string, string | Payload> | undefined;
}> => {
  const handleError: ErrorCallback = (err) => {
    console.error(err);
  };
  const emptyValues = { input: '', searchAttributes: undefined };
  try {
    let query = '';
    if (workflowType && workflowId) {
      query = `WorkflowType = "${workflowType}" AND WorkflowId = "${workflowId}"`;
    } else if (workflowType) {
      query = `WorkflowType = "${workflowType}"`;
    } else if (workflowId) {
      query = `WorkflowId = "${workflowId}"`;
    }

    const route = routeForApi('workflows', { namespace });
    const workflows = await requestFromAPI<ListWorkflowExecutionsResponse>(
      route,
      {
        params: { query, pageSize: '1' },
        handleError,
      },
    );

    if (!workflows?.executions?.[0]) return emptyValues;
    const workflow = toWorkflowExecutions(workflows)[0];

    const firstEvent = await fetchInitialEvent({
      namespace,
      workflowId: workflow.id,
      runId: workflow.runId,
    });

    const startEvent = firstEvent as WorkflowExecutionStartedEvent;
    const convertedAttributes = (await cloneAllPotentialPayloadsWithCodec(
      startEvent?.attributes?.input,
      namespace,
      get(page).data.settings,
      get(authUser).accessToken,
    )) as PotentiallyDecodable;

    const input = stringifyWithBigInt(convertedAttributes?.payloads[0]);
    return {
      input,
      searchAttributes: workflow?.searchAttributes?.indexedFields,
    };
  } catch (e) {
    return emptyValues;
  }
};

export interface RootNode {
  workflow: WorkflowExecution;
  children: RootNode[];
  rootPaths: { runId: string; workflowId: string }[];
}

const buildRoots = (
  root: WorkflowExecution,
  workflows: WorkflowExecution[],
) => {
  const rootMap: RootNode = {
    workflow: root,
    children: [],
    rootPaths: [{ runId: root.runId, workflowId: root.id }],
  };

  const getOrCreateNodes = (node: RootNode, children: WorkflowExecution[]) => {
    if (children?.length) {
      node.children = children.map((wf) => ({
        workflow: wf,
        children: [],
        rootPaths: [...node.rootPaths, { runId: wf.runId, workflowId: wf.id }],
      }));
      node.children.forEach((child) => {
        const nodeChildren = workflows.filter(
          (w) =>
            w?.parent?.workflowId === child.workflow.id &&
            w?.parent?.runId === child.workflow.runId,
        );
        getOrCreateNodes(child, nodeChildren);
      });
    } else {
      node.children = [];
    }
  };

  const rootChildren = workflows.filter(
    (w) => w?.parent?.workflowId === root.id && w?.parent?.runId === root.runId,
  );

  getOrCreateNodes(rootMap, rootChildren);

  return rootMap;
};

export async function fetchAllRootWorkflows(
  namespace: string,
  rootWorkflowId: string,
  rootRunId?: string,
): Promise<RootNode | undefined> {
  try {
    let query = `RootWorkflowId = "${rootWorkflowId}"`;
    if (rootRunId) {
      query += ` AND RootRunId = "${rootRunId}"`;
    }

    const root = await fetchWorkflow({
      namespace,
      workflowId: rootWorkflowId,
      runId: rootRunId,
    });
    const workflows = await fetchAllPaginatedWorkflows(namespace, { query });
    return buildRoots(root?.workflow, workflows);
  } catch (e) {
    return;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fetchAllPaginatedWorkflows = async (
  namespace: string,
  parameters: ValidWorkflowParameters,
  request = fetch,
  archived = false,
): Promise<WorkflowExecution[]> => {
  const rawQuery =
    parameters.query || toListWorkflowQuery(parameters, archived);
  let query: string;
  try {
    query = decodeURIComponent(rawQuery);
  } catch {
    query = rawQuery;
  }
  const route = routeForApi('workflows', { namespace });
  const { executions } = await paginated(async (token: string) => {
    await sleep(500);
    return requestFromAPI<ListWorkflowExecutionsResponse>(route, {
      token,
      request,
      params: { query },
    });
  });
  return toWorkflowExecutions({ executions });
};
