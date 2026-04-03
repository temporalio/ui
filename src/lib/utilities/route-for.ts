import { get } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';

import {
  eventFilterSort,
  workflowViewPreference,
} from '$lib/stores/event-view';
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

export const routeForNamespaces = (): ResolvedPathname => {
  return resolve('/namespaces', {});
};

export const routeForNexus = (): ResolvedPathname => {
  return resolve('/nexus', {});
};

export const routeForNexusEndpoint = (id: string): ResolvedPathname => {
  return resolve('/nexus/[id]', { id });
};

export const routeForNexusEndpointEdit = (id: string): ResolvedPathname => {
  return resolve('/nexus/[id]/edit', { id });
};

export const routeForNexusEndpointCreate = (): ResolvedPathname => {
  return resolve('/nexus/create', {});
};

export const routeForNamespace = ({
  namespace,
}: NamespaceParameter): ResolvedPathname => {
  return resolve('/namespaces/[namespace]', { namespace });
};

export const routeForNamespaceSelector = (): ResolvedPathname => {
  return resolve('/select-namespace', {});
};

export const routeForWorkflows = (
  parameters: NamespaceParameter,
): ResolvedPathname => {
  return `${routeForNamespace(parameters)}/workflows`;
};

export const routeForStandaloneActivities = (
  parameters: NamespaceParameter,
): ResolvedPathname => {
  return `${routeForNamespace(parameters)}/activities`;
};

export const routeForStandaloneActivitiesWithQuery = (
  parameters: NamespaceParameter,
  queryString: string,
): ResolvedPathname => {
  const params = new URLSearchParams();
  params.set('query', queryString);

  return toURL(routeForStandaloneActivities(parameters), params);
};

export const routeForStartStandaloneActivity = (
  parameters: NamespaceParameter & Partial<StartActivityExecutionQueryParams>,
): ResolvedPathname => {
  const params = {
    activityId: parameters.activityId ?? '',
    activityType: parameters.activityType ?? '',
    scheduleToCloseTimeout: parameters.scheduleToCloseTimeout ?? '',
    startToCloseTimeout: parameters.startToCloseTimeout ?? '',
    taskQueue: parameters.taskQueue ?? '',
  };
  return toURL(`${routeForStandaloneActivities(parameters)}/start`, params);
};

const routeForStandaloneActivityBase = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedPathname => {
  const activityId = encodeURIForSvelte(parameters.activityId);

  return `${routeForStandaloneActivities(parameters)}/${activityId}/${parameters.runId}`;
};

export const routeForStandaloneActivityDetails = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedPathname => {
  return `${routeForStandaloneActivityBase(parameters)}/details`;
};

export const routeForStandaloneActivityWorkers = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedPathname => {
  return `${routeForStandaloneActivityBase(parameters)}/workers`;
};

export const routeForStandaloneActivitySearchAttributes = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedPathname => {
  return `${routeForStandaloneActivityBase(parameters)}/search-attributes`;
};

export const routeForStandaloneActivityMetadata = (
  parameters: NamespaceParameter & { activityId: string; runId: string },
): ResolvedPathname => {
  return `${routeForStandaloneActivityBase(parameters)}/metadata`;
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
}: StartWorkflowParameters): ResolvedPathname => {
  return toURL(`${routeForNamespace({ namespace })}/workflows/start-workflow`, {
    workflowId: workflowId || '',
    runId: runId || '',
    taskQueue: taskQueue || '',
    workflowType: workflowType || '',
  });
};

export const routeForWorkflowsWithQuery = ({
  namespace,
  query,
  page,
}: WorkflowsParameter): ResolvedPathname | undefined => {
  if (!BROWSER) {
    return undefined;
  }

  return toURL(routeForWorkflows({ namespace }), {
    query: query ?? '',
    ...(page && { page }),
  });
};

export const routeForArchivalWorkflows = (
  parameters: NamespaceParameter,
): ResolvedPathname => {
  return `${routeForNamespace(parameters)}/archival`;
};

export const baseRouteForWorkflow = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): ResolvedPathname => {
  const id = encodeURIForSvelte(workflow);

  return `${routeForWorkflows(parameters)}/${id}/${run}`;
};

export const routeForSchedules = (
  parameters: NamespaceParameter,
): ResolvedPathname => {
  return `${routeForNamespace(parameters)}/schedules`;
};

export const routeForScheduleCreate = ({
  namespace,
}: NamespaceParameter): ResolvedPathname => {
  return `${routeForSchedules({ namespace })}/create`;
};

export const routeForSchedule = ({
  scheduleId,
  namespace,
}: ScheduleParameters): ResolvedPathname => {
  const id = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${id}`;
};

export const routeForScheduleEdit = ({
  scheduleId,
  namespace,
}: ScheduleParameters): ResolvedPathname => {
  const id = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${id}/edit`;
};

export const routeForArchivalEventHistory = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): ResolvedPathname => {
  const id = encodeURIForSvelte(workflow);
  return `${routeForArchivalWorkflows(parameters)}/${id}/${run}/history`;
};

export const routeForEventHistory = ({
  queryParams,
  archival,
  ...parameters
}: EventHistoryParameters & { archival?: boolean }): ResolvedPathname => {
  if (archival) return toURL(routeForArchivalEventHistory(parameters));
  const eventHistoryPath = `${baseRouteForWorkflow(parameters)}/history`;
  return toURL(`${eventHistoryPath}`, queryParams);
};

export const routeForEventHistoryEvent = ({
  eventId,
  requestId,
  ...parameters
}: EventParameters): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/history/events/${eventId || requestId}`;
};

export const routeForTimeline = ({
  queryParams,
  archival,
  ...parameters
}: WorkflowParameters & {
  queryParams?: Record<string, string>;
  archival?: boolean;
}): ResolvedPathname => {
  if (archival) return toURL(routeForArchivalEventHistory(parameters));
  const path = `${baseRouteForWorkflow(parameters)}/timeline`;
  return toURL(path, queryParams);
};

export const routeForWorkflow = ({
  queryParams,
  ...parameters
}: EventHistoryParameters & { archival?: boolean }): ResolvedPathname => {
  if (!BROWSER) return routeForTimeline({ ...parameters, queryParams });

  const view = get(workflowViewPreference);
  const sort = get(eventFilterSort);
  const params: Record<string, string> = {
    ...(sort !== 'descending' && { sort }),
    ...queryParams,
  };

  const hasParams = Object.keys(params).length > 0;

  if (view === 'history') {
    return routeForEventHistory({
      ...parameters,
      ...(hasParams && { queryParams: params }),
    });
  }
  return routeForTimeline({
    ...parameters,
    ...(hasParams && { queryParams: params }),
  });
};

export const routeForWorkers = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/workers`;
};

export const routeForWorkerDeployments = ({
  namespace,
}: {
  namespace: string;
}): ResolvedPathname => {
  return resolve('/namespaces/[namespace]/worker-deployments', {
    namespace,
  });
};

export const routeForWorkerDeployment = ({
  namespace,
  deployment,
}: {
  namespace: string;
  deployment: string;
}): ResolvedPathname => {
  const deploymentName = encodeURIForSvelte(deployment);
  return resolve('/namespaces/[namespace]/worker-deployments/[deployment]', {
    namespace,
    deployment: deploymentName,
  });
};

export const routeForWorkerDeploymentVersion = ({
  namespace,
  deployment,
  version,
}: {
  namespace: string;
  deployment: string;
  version: string;
}): ResolvedPathname => {
  return `${routeForWorkerDeployment({
    namespace,
    deployment,
  })}/version/${version}`;
};

export const routeForRelationships = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/relationships`;
};

export const routeForTaskQueue = (
  parameters: TaskQueueParameters,
): ResolvedPathname => {
  const queue = encodeURIForSvelte(parameters.queue);

  return `${routeForNamespace({
    namespace: parameters.namespace,
  })}/task-queues/${queue}`;
};

export const routeForCallStack = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/call-stack`;
};

export const routeForWorkflowQuery = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/query`;
};

export const routeForUserMetadata = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/user-metadata`;
};

export const routeForWorkflowSearchAttributes = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/search-attributes`;
};

export const routeForWorkflowMemo = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/memo`;
};

export const routeForWorkflowUpdate = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/update`;
};

export const routeForPendingActivities = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/pending-activities`;
};

export const routeForNexusLinks = (
  parameters: WorkflowParameters,
): ResolvedPathname => {
  return `${baseRouteForWorkflow(parameters)}/nexus-links`;
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
): ResolvedPathname => {
  if (isBrowser) {
    const login = new URL(resolve('/login', {}), window.location.origin);
    login.searchParams.set('returnUrl', window.location.href);
    if (error) {
      login.searchParams.set('error', error);
    }
    return login.toString();
  }

  return resolve('/login', {});
};

export const routeForEventHistoryImport = (
  namespace?: string,
  view?: EventView,
): ResolvedPathname => {
  if (namespace && view) {
    return resolve('/import/events/[namespace]/workflow/run/history/[view]', {
      namespace,
      view,
    });
  }
  return resolve('/import/events', {});
};

export const routeForBatchOperations = ({
  namespace,
}: {
  namespace: string;
}): ResolvedPathname => {
  return resolve('/namespaces/[namespace]/batch-operations', {
    namespace,
  });
};

export const routeForBatchOperation = ({
  namespace,
  jobId,
}: {
  namespace: string;
  jobId: string;
}): ResolvedPathname => {
  const jId = encodeURIForSvelte(jobId);

  return resolve('/namespaces/[namespace]/batch-operations/[jobId]', {
    namespace,
    jobId: jId,
  });
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
