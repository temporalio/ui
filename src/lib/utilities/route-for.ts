import { BROWSER } from 'esm-env';

import { resolve } from '$app/paths';

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

export const routeForNamespaces = (): string => {
  return resolve('/namespaces', {});
};

export const routeForNexus = (): string => {
  return resolve('/nexus', {});
};

export const routeForNexusEndpoint = (id: string): string => {
  return resolve('/nexus/[id]', { id });
};

export const routeForNexusEndpointEdit = (id: string): string => {
  return resolve('/nexus/[id]/edit', { id });
};

export const routeForNexusEndpointCreate = (): string => {
  return resolve('/nexus/create', {});
};

export const routeForNamespace = ({
  namespace,
}: NamespaceParameter): string => {
  return resolve('/namespaces/[namespace]', { namespace });
};

export const routeForNamespaceSelector = () => {
  return resolve('/select-namespace', {});
};

export const routeForWorkflows = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/workflows`;
};

export const routeForStandaloneActivities = (
  parameters: NamespaceParameter,
): string => {
  return `${routeForNamespace(parameters)}/activities`;
};

export const routeForStandaloneActivitiesWithQuery = (
  parameters: NamespaceParameter,
  queryString: string,
): string => {
  const params = new URLSearchParams();
  params.set('query', queryString);

  return toURL(routeForStandaloneActivities(parameters), params);
};

export const routeForStartStandaloneActivity = (
  parameters: NamespaceParameter & Partial<StartActivityExecutionQueryParams>,
): string => {
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
  parameters: NamespaceParameter & { activityId: string },
) => {
  return resolve(`${routeForStandaloneActivities(parameters)}/[activityId]`, {
    activityId: parameters.activityId,
  });
};

export const routeForStandaloneActivityDetails = (
  parameters: NamespaceParameter & { activityId: string },
) => {
  return `${routeForStandaloneActivityBase(parameters)}/details`;
};

export const routeForStandaloneActivityWorkers = (
  parameters: NamespaceParameter & { activityId: string },
) => {
  return `${routeForStandaloneActivityBase(parameters)}/workers`;
};

export const routeForStandaloneActivitySearchAttributes = (
  parameters: NamespaceParameter & { activityId: string },
) => {
  return `${routeForStandaloneActivityBase(parameters)}/search-attributes`;
};

export const routeForStandaloneActivityMetadata = (
  parameters: NamespaceParameter & { activityId: string },
) => {
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
}: StartWorkflowParameters): string => {
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
}: WorkflowsParameter): string | undefined => {
  if (!BROWSER) {
    return undefined;
  }

  return toURL(routeForWorkflows({ namespace }), {
    query,
    ...(page && { page }),
  });
};

export const routeForArchivalWorkflows = (
  parameters: NamespaceParameter,
): string => {
  return `${routeForNamespace(parameters)}/archival`;
};

export const routeForWorkflow = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): string => {
  const wid = encodeURIForSvelte(workflow);

  return `${routeForWorkflows(parameters)}/${wid}/${run}`;
};

export const routeForSchedules = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/schedules`;
};

export const routeForScheduleCreate = ({
  namespace,
}: NamespaceParameter): string => {
  return `${routeForSchedules({ namespace })}/create`;
};

export const routeForSchedule = ({
  scheduleId,
  namespace,
}: ScheduleParameters): string => {
  const sid = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${sid}`;
};

export const routeForScheduleEdit = ({
  scheduleId,
  namespace,
}: ScheduleParameters): string => {
  const sid = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${sid}/edit`;
};

export const routeForArchivalEventHistory = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): string => {
  const wid = encodeURIForSvelte(workflow);
  return `${routeForArchivalWorkflows(parameters)}/${wid}/${run}/history`;
};

export const routeForEventHistory = ({
  queryParams,
  archival,
  ...parameters
}: EventHistoryParameters & { archival?: boolean }): string => {
  if (archival) return toURL(routeForArchivalEventHistory(parameters));
  const eventHistoryPath = `${routeForWorkflow(parameters)}/history`;
  return toURL(`${eventHistoryPath}`, queryParams);
};

export const routeForEventHistoryEvent = ({
  eventId,
  requestId,
  ...parameters
}: EventParameters): string => {
  return `${routeForWorkflow(parameters)}/history/events/${eventId || requestId}`;
};

export const routeForWorkers = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace({ namespace: parameters.namespace })}/workers`;
};

export const routeForWorkflowWorkers = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/workers`;
};

export const routeForWorkerDeployments = ({
  namespace,
}: {
  namespace: string;
}) => {
  return resolve('/namespaces/[namespace]/worker-deployments', { namespace });
};

export const routeForWorkerInstance = ({
  namespace,
  workerInstanceKey,
}: {
  namespace: string;
  workerInstanceKey: string;
}) => {
  const workerInstanceKeyEncoded = encodeURIForSvelte(workerInstanceKey);
  return resolve('/namespaces/[namespace]/workers/[workerInstanceKey]', {
    namespace,
    workerInstanceKey: workerInstanceKeyEncoded,
  });
};

export const routeForWorkerDeployment = ({
  namespace,
  deployment,
}: {
  namespace: string;
  deployment: string;
}) => {
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
}) => {
  return `${routeForWorkerDeployment({
    namespace,
    deployment,
  })}/version/${version}`;
};

export const routeForRelationships = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/relationships`;
};

export const routeForTaskQueue = (parameters: TaskQueueParameters): string => {
  const queue = encodeURIForSvelte(parameters.queue);

  return `${routeForNamespace({
    namespace: parameters.namespace,
  })}/task-queues/${queue}`;
};

export const routeForCallStack = (parameters: WorkflowParameters): string => {
  return `${routeForWorkflow(parameters)}/call-stack`;
};

export const routeForWorkflowQuery = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/query`;
};

export const routeForUserMetadata = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/user-metadata`;
};

export const routeForWorkflowSearchAttributes = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/search-attributes`;
};

export const routeForWorkflowMemo = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/memo`;
};

export const routeForWorkflowUpdate = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/update`;
};

export const routeForPendingActivities = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/pending-activities`;
};

export const routeForNexusLinks = (parameters: WorkflowParameters): string => {
  return `${routeForWorkflow(parameters)}/nexus-links`;
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

export const routeForLoginPage = (error = '', isBrowser = BROWSER): string => {
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
): string => {
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
}) => {
  return resolve('/namespaces/[namespace]/batch-operations', { namespace });
};

export const routeForBatchOperation = ({
  namespace,
  jobId,
}: {
  namespace: string;
  jobId: string;
}) => {
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
