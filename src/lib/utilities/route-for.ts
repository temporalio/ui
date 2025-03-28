import { BROWSER } from 'esm-env';

import { base } from '$app/paths';

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
  scheduleId: string;
  queue: string;
  schedule: string;
  query?: string;
  search?: string;
  page?: string;
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
  'namespace' | 'workflow' | 'run' | 'view' | 'eventId'
>;

export type AuthenticationParameters = {
  settings: Settings;
  searchParams?: URLSearchParams;
  originUrl?: string;
};

export const routeForNamespaces = (): string => {
  return `${base}/namespaces`;
};

export const routeForNexus = (): string => {
  return `${base}/nexus`;
};

export const routeForNexusEndpoint = (id: string): string => {
  return `${base}/nexus/${id}`;
};

export const routeForNexusEndpointEdit = (id: string): string => {
  return `${base}/nexus/${id}/edit`;
};

export const routeForNexusEndpointCreate = (): string => {
  return `${base}/nexus/create`;
};

export const routeForNamespace = ({
  namespace,
}: NamespaceParameter): string => {
  return `${base}/namespaces/${namespace}`;
};

export const routeForNamespaceSelector = () => {
  return `${base}/select-namespace`;
};

export const routeForWorkflows = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/workflows`;
};

type StartWorkflowParameters = NamespaceParameter &
  Partial<{ workflowId: string; taskQueue: string; workflowType: string }>;
export const routeForWorkflowStart = ({
  namespace,
  workflowId,
  taskQueue,
  workflowType,
}: StartWorkflowParameters): string => {
  return toURL(`${routeForNamespace({ namespace })}/workflows/start-workflow`, {
    workflowId: workflowId || '',
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

export const routeForArchivalWorkfows = (
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

export const routeForWorkflowHistoryJson = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): string => {
  return `${routeForWorkflows(parameters)}/${workflow}/${run}/history.json`;
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

export const routeForEventHistory = ({
  queryParams,
  ...parameters
}: EventHistoryParameters): string => {
  const eventHistoryPath = `${routeForWorkflow(parameters)}/history`;
  return toURL(`${eventHistoryPath}`, queryParams, parameters?.eventId);
};

export const routeForEventHistoryEvent = ({
  eventId,
  ...parameters
}: EventParameters): string => {
  return `${routeForWorkflow(parameters)}/history/events/${eventId}`;
};

export const routeForEventGroup = ({
  eventId,
  ...parameters
}: EventParameters): string => {
  return `${routeForWorkflow(parameters)}/history/event-groups/${eventId}`;
};

export const routeForWorkers = (parameters: WorkflowParameters): string => {
  return `${routeForWorkflow(parameters)}/workers`;
};

export const routeForWorkerDeployments = ({
  namespace,
}: {
  namespace: string;
}) => {
  return `${base}/namespaces/${namespace}/worker-deployments`;
};

export const routeForWorkerDeployment = ({
  namespace,
  deployment,
}: {
  namespace: string;
  deployment: string;
}) => {
  const deploymentName = encodeURIForSvelte(deployment);
  return `${base}/namespaces/${namespace}/worker-deployments/${deploymentName}`;
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

export const routeForWorkflowMetadata = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/metadata`;
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

export const routeForAuthentication = (
  parameters: AuthenticationParameters,
): string => {
  const { settings, searchParams: currentSearchParams, originUrl } = parameters;

  const login = new URL(`${base}/auth/sso`, settings.baseUrl);
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
    const login = new URL(`${base}/login`, window.location.origin);
    login.searchParams.set('returnUrl', window.location.href);
    if (error) {
      login.searchParams.set('error', error);
    }
    return login.toString();
  }

  return `${base}/login`;
};

export const routeForEventHistoryImport = (
  namespace?: string,
  view?: EventView,
): string => {
  if (namespace && view) {
    return `${base}/import/events/${namespace}/workflow/run/history/${view}`;
  }
  return `${base}/import/events`;
};

export const routeForBatchOperations = ({
  namespace,
}: {
  namespace: string;
}) => {
  return `${base}/namespaces/${namespace}/batch-operations`;
};

export const routeForBatchOperation = ({
  namespace,
  jobId,
}: {
  namespace: string;
  jobId: string;
}) => {
  return `${base}/namespaces/${namespace}/batch-operations/${jobId}`;
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
