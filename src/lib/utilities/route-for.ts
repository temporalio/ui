import { BROWSER } from 'esm-env';

import { resolve } from '$app/paths';

declare const __type: unique symbol;
export type ResolvedRoute = string & { readonly [__type]: 'ResolvedRoute' };

import type { EventView } from '$lib/types/events';
import type { Settings } from '$lib/types/global';
import { encodeURIForSvelte } from '$lib/utilities/encode-uri';
import { toURL } from '$lib/utilities/to-url';

type RouteParameters = {
  namespace: string;
  workflow: string;
  run: string;
  view?: EventView | string;
  queryParams?: Record<string, string>;
  eventId?: string;
  eventType?: string;
  requestId?: string;
  scheduleId: string;
  queue: string;
  schedule: string;
  query?: string;
  search?: string;
  page?: string;
  archival?: boolean;
};

export type NamespaceParameter = Pick<RouteParameters, 'namespace'>;
export type WorkflowsParameter = Pick<
  RouteParameters,
  'namespace' | 'query' | 'page'
>;
export type TaskQueueParameters = Pick<RouteParameters, 'namespace' | 'queue'>;
export type WorkflowParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run'
>;
export type ScheduleParameters = Pick<
  RouteParameters,
  'namespace' | 'scheduleId'
>;
export type EventHistoryParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run' | 'eventId' | 'view' | 'queryParams'
>;
export type EventParameters = Pick<
  RouteParameters,
  | 'namespace'
  | 'workflow'
  | 'run'
  | 'view'
  | 'eventId'
  | 'eventType'
  | 'requestId'
>;

export type AuthenticationParameters = {
  settings: Settings;
  searchParams?: URLSearchParams;
  originUrl?: string;
};

export interface StartActivityExecutionQueryParams {
  activityId: string;
  activityType: string;
  taskQueue: string;
  startToCloseTimeout: string;
  scheduleToCloseTimeout: string;
}

export const routeForNamespaces = (): ResolvedRoute => {
  return resolve('/namespaces', {}) as ResolvedRoute;
};

export const routeForNexus = (): ResolvedRoute => {
  return resolve('/nexus', {}) as ResolvedRoute;
};

export const routeForNexusEndpoint = (id: string): ResolvedRoute => {
  return resolve('/nexus/[id]', { id }) as ResolvedRoute;
};

export const routeForNexusEndpointEdit = (id: string): ResolvedRoute => {
  return resolve('/nexus/[id]/edit', { id }) as ResolvedRoute;
};

export const routeForNexusEndpointCreate = (): ResolvedRoute => {
  return resolve('/nexus/create', {}) as ResolvedRoute;
};

export const routeForNamespace = ({
  namespace,
}: NamespaceParameter): ResolvedRoute => {
  return resolve('/namespaces/[namespace]', { namespace }) as ResolvedRoute;
};

export const routeForNamespaceSelector = (): ResolvedRoute => {
  return resolve('/select-namespace', {}) as ResolvedRoute;
};

export const routeForWorkflows = (
  parameters: NamespaceParameter,
): ResolvedRoute => {
  return `${routeForNamespace(parameters)}/workflows` as ResolvedRoute;
};

export const routeForStandaloneActivities = (
  parameters: NamespaceParameter,
): ResolvedRoute => {
  return `${routeForNamespace(parameters)}/activities` as ResolvedRoute;
};

export const routeForStandaloneActivitiesWithQuery = (
  parameters: NamespaceParameter,
  queryString: string,
): ResolvedRoute => {
  const params = new URLSearchParams();
  params.set('query', queryString);

  return toURL(
    routeForStandaloneActivities(parameters),
    params,
  ) as ResolvedRoute;
};

export const routeForStartStandaloneActivity = (
  parameters: NamespaceParameter & Partial<StartActivityExecutionQueryParams>,
): ResolvedRoute => {
  const params = {
    activityId: parameters.activityId ?? '',
    activityType: parameters.activityType ?? '',
    scheduleToCloseTimeout: parameters.scheduleToCloseTimeout ?? '',
    startToCloseTimeout: parameters.startToCloseTimeout ?? '',
    taskQueue: parameters.taskQueue ?? '',
  };
  return toURL(
    `${routeForStandaloneActivities(parameters)}/start`,
    params,
  ) as ResolvedRoute;
};

const routeForStandaloneActivityBase = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedRoute => {
  const activityId = encodeURIForSvelte(parameters.activityId);

  return `${routeForStandaloneActivities(parameters)}/${activityId}/${parameters.runId}` as ResolvedRoute;
};

export const routeForStandaloneActivityDetails = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedRoute => {
  return `${routeForStandaloneActivityBase(parameters)}/details` as ResolvedRoute;
};

export const routeForStandaloneActivityWorkers = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedRoute => {
  return `${routeForStandaloneActivityBase(parameters)}/workers` as ResolvedRoute;
};

export const routeForStandaloneActivitySearchAttributes = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedRoute => {
  return `${routeForStandaloneActivityBase(parameters)}/search-attributes` as ResolvedRoute;
};

export const routeForStandaloneActivityMetadata = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedRoute => {
  return `${routeForStandaloneActivityBase(parameters)}/metadata` as ResolvedRoute;
};

type StartWorkflowParameters = NamespaceParameter &
  Partial<{
    workflowId: string;
    runId: string;
    taskQueue: string;
    workflowType: string;
  }>;
export const routeForWorkflowStart = ({
  namespace,
  workflowId,
  runId,
  taskQueue,
  workflowType,
}: StartWorkflowParameters): ResolvedRoute => {
  return toURL(`${routeForNamespace({ namespace })}/workflows/start-workflow`, {
    workflowId: workflowId || '',
    runId: runId || '',
    taskQueue: taskQueue || '',
    workflowType: workflowType || '',
  }) as ResolvedRoute;
};

export const routeForWorkflowsWithQuery = ({
  namespace,
  query,
  page,
}: WorkflowsParameter): ResolvedRoute | undefined => {
  if (!BROWSER) {
    return undefined;
  }

  return toURL(routeForWorkflows({ namespace }), {
    query: query ?? '',
    ...(page && { page }),
  }) as ResolvedRoute;
};

export const routeForArchivalWorkflows = (
  parameters: NamespaceParameter,
): ResolvedRoute => {
  return `${routeForNamespace(parameters)}/archival` as ResolvedRoute;
};

export const routeForWorkflow = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): ResolvedRoute => {
  const id = encodeURIForSvelte(workflow);

  return `${routeForWorkflows(parameters)}/${id}/${run}` as ResolvedRoute;
};

export const routeForSchedules = (
  parameters: NamespaceParameter,
): ResolvedRoute => {
  return `${routeForNamespace(parameters)}/schedules` as ResolvedRoute;
};

export const routeForScheduleCreate = ({
  namespace,
}: NamespaceParameter): ResolvedRoute => {
  return `${routeForSchedules({ namespace })}/create` as ResolvedRoute;
};

export const routeForSchedule = ({
  scheduleId,
  namespace,
}: ScheduleParameters): ResolvedRoute => {
  const id = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${id}` as ResolvedRoute;
};

export const routeForScheduleEdit = ({
  scheduleId,
  namespace,
}: ScheduleParameters): ResolvedRoute => {
  const id = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${id}/edit` as ResolvedRoute;
};

export const routeForArchivalEventHistory = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): ResolvedRoute => {
  const id = encodeURIForSvelte(workflow);
  return `${routeForArchivalWorkflows(parameters)}/${id}/${run}/history` as ResolvedRoute;
};

export const routeForEventHistory = ({
  queryParams,
  archival,
  ...parameters
}: EventHistoryParameters & { archival?: boolean }): ResolvedRoute => {
  if (archival)
    return toURL(routeForArchivalEventHistory(parameters)) as ResolvedRoute;
  const eventHistoryPath = `${routeForWorkflow(parameters)}/history`;
  return toURL(`${eventHistoryPath}`, queryParams) as ResolvedRoute;
};

export const routeForEventHistoryEvent = ({
  eventId,
  requestId,
  ...parameters
}: EventParameters): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/history/events/${eventId || requestId}` as ResolvedRoute;
};

export const routeForTimeline = ({
  queryParams,
  archival,
  ...parameters
}: WorkflowParameters & {
  queryParams?: Record<string, string>;
  archival?: boolean;
}): ResolvedRoute => {
  if (archival)
    return toURL(routeForArchivalEventHistory(parameters)) as ResolvedRoute;
  const path = `${routeForWorkflow(parameters)}/timeline`;
  return toURL(path, queryParams) as ResolvedRoute;
};

export const routeForWorkers = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/workers` as ResolvedRoute;
};

export const routeForWorkerDeployments = ({
  namespace,
}: {
  namespace: string;
}): ResolvedRoute => {
  return resolve('/namespaces/[namespace]/worker-deployments', {
    namespace,
  }) as ResolvedRoute;
};

export const routeForWorkerDeployment = ({
  namespace,
  deployment,
}: {
  namespace: string;
  deployment: string;
}): ResolvedRoute => {
  const deploymentName = encodeURIForSvelte(deployment);
  return resolve('/namespaces/[namespace]/worker-deployments/[deployment]', {
    namespace,
    deployment: deploymentName,
  }) as ResolvedRoute;
};

export const routeForWorkerDeploymentVersion = ({
  namespace,
  deployment,
  version,
}: {
  namespace: string;
  deployment: string;
  version: string;
}): ResolvedRoute => {
  return `${routeForWorkerDeployment({
    namespace,
    deployment,
  })}/version/${version}` as ResolvedRoute;
};

export const routeForRelationships = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/relationships` as ResolvedRoute;
};

export const routeForTaskQueue = (
  parameters: TaskQueueParameters,
): ResolvedRoute => {
  const queue = encodeURIForSvelte(parameters.queue);

  return `${routeForNamespace({
    namespace: parameters.namespace,
  })}/task-queues/${queue}` as ResolvedRoute;
};

export const routeForCallStack = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/call-stack` as ResolvedRoute;
};

export const routeForWorkflowQuery = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/query` as ResolvedRoute;
};

export const routeForUserMetadata = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/user-metadata` as ResolvedRoute;
};

export const routeForWorkflowSearchAttributes = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/search-attributes` as ResolvedRoute;
};

export const routeForWorkflowMemo = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/memo` as ResolvedRoute;
};

export const routeForWorkflowUpdate = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/update` as ResolvedRoute;
};

export const routeForPendingActivities = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/pending-activities` as ResolvedRoute;
};

export const routeForNexusLinks = (
  parameters: WorkflowParameters,
): ResolvedRoute => {
  return `${routeForWorkflow(parameters)}/nexus-links` as ResolvedRoute;
};

export const routeForAuthentication = (
  parameters: AuthenticationParameters,
): string => {
  const { settings, searchParams: currentSearchParams, originUrl } = parameters;

  const login = new URL(resolve('/auth/sso', {}), settings.baseUrl);
  let opts = settings.auth.options ?? [];

  opts = [...opts, 'returnUrl'];

  opts.forEach((option) => {
    if (!currentSearchParams) return;
    const searchParam = currentSearchParams.get(option);
    if (searchParam) {
      login.searchParams.set(option, searchParam);
    }
  });

  if (!login.searchParams.get('returnUrl') && originUrl) {
    login.searchParams.set('returnUrl', originUrl);
  }

  return login.toString();
};

export const routeForLoginPage = (
  error = '',
  isBrowser = BROWSER,
): ResolvedRoute => {
  if (isBrowser) {
    const login = new URL(resolve('/login', {}), window.location.origin);
    login.searchParams.set('returnUrl', window.location.href);
    if (error) {
      login.searchParams.set('error', error);
    }
    return login.toString() as ResolvedRoute;
  }

  return resolve('/login', {}) as ResolvedRoute;
};

export const routeForEventHistoryImport = (
  namespace?: string,
  view?: EventView,
): ResolvedRoute => {
  if (namespace && view) {
    return resolve('/import/events/[namespace]/workflow/run/history/[view]', {
      namespace,
      view,
    }) as ResolvedRoute;
  }
  return resolve('/import/events', {}) as ResolvedRoute;
};

export const routeForBatchOperations = ({
  namespace,
}: {
  namespace: string;
}): ResolvedRoute => {
  return resolve('/namespaces/[namespace]/batch-operations', {
    namespace,
  }) as ResolvedRoute;
};

export const routeForBatchOperation = ({
  namespace,
  jobId,
}: {
  namespace: string;
  jobId: string;
}): ResolvedRoute => {
  const jId = encodeURIForSvelte(jobId);

  return resolve('/namespaces/[namespace]/batch-operations/[jobId]', {
    namespace,
    jobId: jId,
  }) as ResolvedRoute;
};

export const hasParameters =
  <T extends Record<string, string | Record<string, string>>>(
    ...required: string[]
  ) =>
  (
    parameters: Record<string, string | Record<string, string>>,
  ): parameters is T => {
    for (const parameter of required) {
      if (!parameters[parameter]) return false;
    }
    return true;
  };

export const isNamespaceParameter =
  hasParameters<NamespaceParameter>('namespace');

export const isWorkflowParameters = hasParameters<WorkflowParameters>(
  'namespace',
  'workflow',
  'run',
);

export const isEventHistoryParameters = hasParameters<EventHistoryParameters>(
  'namespace',
  'workflow',
  'run',
  'view',
  'queryParams',
);

export const isEventParameters = hasParameters<EventParameters>(
  'namespace',
  'workflow',
  'run',
  'eventId',
);
