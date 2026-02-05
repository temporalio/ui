import { get } from 'svelte/store';

import { resolve } from '$app/paths';
import { page } from '$app/stores';

import type {
  APIRouteParameters,
  APIRoutePath,
  BatchAPIRoutePath,
  BatchRouteParameters,
  NamespaceAPIRoutePath,
  NamespaceRouteParameters,
  NexusAPIRoutePath,
  NexusRouteParameters,
  ParameterlessAPIRoutePath,
  ScheduleAPIRoutePath,
  ScheduleListRouteParameters,
  ScheduleRouteParameters,
  SchedulesAPIRoutePath,
  SearchAttributesRouteParameters,
  SearchAttributesRoutePath,
  StandaloneActivitiesAPIRoutePath,
  StandaloneActivitiesParameters,
  StandaloneActivityAPIRoutePath,
  StandaloneActivityParameters,
  TaskQueueAPIRoutePath,
  TaskQueueRouteParameters,
  WorkerAPIRoutePath,
  WorkerDeploymentAPIRoutePath,
  WorkerDeploymentListRouteParameters,
  WorkerDeploymentRouteParameters,
  WorkerDeploymentsAPIRoutePath,
  WorkerDeploymentVersionAPIRoutePath,
  WorkerDeploymentVersionRouteParameters,
  WorkflowActivitiesAPIRoutePath,
  WorkflowActivitiesRouteParameters,
  WorkflowAPIRoutePath,
  WorkflowListRouteParameters,
  WorkflowQueryAPIRoutePath,
  WorkflowQueryRouteParameters,
  WorkflowRawHistoryRouteParameters,
  WorkflowRouteParameters,
  WorkflowsAPIRoutePath,
  WorkflowSignalAPIRoutePath,
  WorkflowSignalRouteParameters,
  WorkflowUpdateAPIRoutePath,
  WorkflowUpdateRouteParameters,
} from '$lib/types/api';

import { getApiOrigin } from './get-api-origin';
import { minimumVersionRequired } from './version-check';

const replaceNamespaceInApiUrl = (
  apiUrl: string,
  namespace: string,
): string => {
  if (apiUrl) {
    return apiUrl.replace('%namespace%', namespace);
  }
  return '';
};

export const base = (namespace?: string): string => {
  let baseUrl = '';
  const webUrl: string | undefined = get(page).data?.webUrl;

  const webUrlExistsWithNamespace = webUrl && namespace;
  const apiUrlExistsWithNamespace = globalThis?.AppConfig?.apiUrl && namespace;

  if (webUrlExistsWithNamespace) {
    baseUrl = webUrl;
  } else if (apiUrlExistsWithNamespace) {
    console.warn('Using fallback api url, web url not found');
    baseUrl = replaceNamespaceInApiUrl(globalThis.AppConfig.apiUrl, namespace);
  } else {
    baseUrl = getApiOrigin();
  }

  baseUrl = `${baseUrl}${resolve('', {})}`; // Append base path

  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  return baseUrl;
};

const getPath = (endpoint: string): string => {
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1);
  return `/api/v1/${endpoint}`;
};

const withBase = (path: string, namespace?: string): string => {
  const baseUrl = base(namespace);
  return `${baseUrl}${path}`;
};

const encode = (
  parameters: Partial<APIRouteParameters>,
): APIRouteParameters => {
  const version = get(page)?.data?.settings?.version;
  return Object.keys(parameters ?? {}).reduce(
    (acc, key) => {
      if (version && minimumVersionRequired('2.23.0', version)) {
        acc[key] = encodeURIComponent(parameters[key]);
      } else {
        acc[key] = encodeURIComponent(encodeURIComponent(parameters[key]));
      }
      return acc;
    },
    {
      namespace: '',
      workflowId: '',
      scheduleId: '',
      queue: '',
      queryType: '',
      signalName: '',
      updateName: '',
      batchJobId: '',
      runId: '',
      activityId: '',
      endpointId: '',
      deploymentName: '',
      version: '',
    },
  );
};

export function pathForApi(
  route: APIRoutePath,
  parameters?: Partial<APIRouteParameters>,
  shouldEncode = true,
): string {
  if (shouldEncode) parameters = encode(parameters);

  const routes: { [K in APIRoutePath]: string } = {
    systemInfo: '/system-info',
    cluster: '/cluster-info',
    namespaces: '/namespaces',
    namespace: `/namespaces/${parameters?.namespace}`,
    'search-attributes': `/namespaces/${parameters.namespace}/search-attributes`,
    'events.raw': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/run/${parameters?.runId}/history.json`,
    'events.ascending': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/history`,
    'events.descending': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/history-reverse`,
    query: `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/query/${parameters.queryType}`,
    schedule: `/namespaces/${parameters?.namespace}/schedules/${parameters?.scheduleId}`,
    'schedule.patch': `/namespaces/${parameters?.namespace}/schedules/${parameters?.scheduleId}/patch`,
    'schedule.edit': `/namespaces/${parameters?.namespace}/schedules/${parameters?.scheduleId}/update`,
    schedules: `/namespaces/${parameters?.namespace}/schedules`,
    settings: '/settings',
    'task-queue': `/namespaces/${parameters?.namespace}/task-queues/${parameters?.queue}`,
    'task-queue.compatibility': `/namespaces/${parameters?.namespace}/task-queues/${parameters?.queue}/worker-build-id-compatibility`,
    'task-queue.rules': `/namespaces/${parameters?.namespace}/task-queues/${parameters?.queue}/worker-versioning-rules`,
    user: '/me',
    'worker-task-reachability': `/namespaces/${parameters?.namespace}/worker-task-reachability`,
    'workflow.terminate': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/terminate`,
    'workflow.cancel': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/cancel`,
    'workflow.signal': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/signal/${parameters.signalName}`,
    'workflow.update': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/update/${parameters.updateName}`,
    'workflow.reset': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/reset`,
    workflow: `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}`,
    workflows: `/namespaces/${parameters?.namespace}/workflows`,
    'workflows.archived': `/namespaces/${parameters?.namespace}/archived-workflows`,
    'workflows.count': `/namespaces/${parameters?.namespace}/workflow-count`,
    'activity.complete': `/namespaces/${parameters.namespace}/activities/complete-by-id`,
    'activity.fail': `/namespaces/${parameters.namespace}/activities/fail-by-id`,
    'activity.pause': `/namespaces/${parameters.namespace}/activities/pause`,
    'activity.unpause': `/namespaces/${parameters.namespace}/activities/unpause`,
    'activity.reset': `/namespaces/${parameters.namespace}/activities/reset`,
    'activity.update-options': `/namespaces/${parameters.namespace}/activities/update-options`,
    'batch-operations.list': `/namespaces/${parameters.namespace}/batch-operations`,
    'batch-operations': `/namespaces/${parameters.namespace}/batch-operations/${parameters?.batchJobId}`,
    'nexus-endpoints': '/nexus/endpoints',
    'nexus-endpoint': `/nexus/endpoints/${parameters.endpointId}`,
    'nexus-endpoint.update': `/nexus/endpoints/${parameters.endpointId}/update`,
    'worker-deployments': `/namespaces/${parameters.namespace}/worker-deployments`,
    'worker-deployment': `/namespaces/${parameters.namespace}/worker-deployments/${parameters.deploymentName}`,
    'worker-deployment-version': `/namespaces/${parameters.namespace}/worker-deployment-versions/${parameters.version}`,
    'standalone-activity': `/namespaces/${parameters.namespace}/activities/${parameters.activityId}`,
    'standalone-activities': `/namespaces/${parameters.namespace}/activities`,
    'standalone-activities.count': `/namespaces/${parameters.namespace}/activity-count`,
    'standalone-activity.cancel': `/namespaces/${parameters.namespace}/activities/${parameters.activityId}/cancel`,
    'standalone-activity.terminate': `/namespaces/${parameters.namespace}/activities/${parameters.activityId}/terminate`,
  };

  return getPath(routes[route]);
}

export function routeForApi(
  route: StandaloneActivitiesAPIRoutePath,
  parameters: StandaloneActivitiesParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: StandaloneActivityAPIRoutePath,
  parameters: StandaloneActivityParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkflowsAPIRoutePath,
  parameters: WorkflowListRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: NamespaceAPIRoutePath,
  parameters: NamespaceRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: SchedulesAPIRoutePath,
  parameters: ScheduleListRouteParameters,
): string;
export function routeForApi(
  route: WorkerAPIRoutePath,
  parameters: NamespaceRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkflowAPIRoutePath,
  parameters: WorkflowRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkflowAPIRoutePath,
  parameters: WorkflowRawHistoryRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkflowSignalAPIRoutePath,
  parameters: WorkflowSignalRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkflowUpdateAPIRoutePath,
  parameters: WorkflowUpdateRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkflowQueryAPIRoutePath,
  parameters: WorkflowQueryRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkflowActivitiesAPIRoutePath,
  parameters: WorkflowActivitiesRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: BatchAPIRoutePath,
  parameters: BatchRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: ScheduleAPIRoutePath,
  parameters: ScheduleRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: TaskQueueAPIRoutePath,
  parameters: TaskQueueRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: SearchAttributesRoutePath,
  parameters: SearchAttributesRouteParameters,
): string;
export function routeForApi(
  route: NexusAPIRoutePath,
  parameters: NexusRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkerDeploymentsAPIRoutePath,
  parameters: WorkerDeploymentListRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkerDeploymentAPIRoutePath,
  parameters: WorkerDeploymentRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: WorkerDeploymentVersionAPIRoutePath,
  parameters: WorkerDeploymentVersionRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(route: ParameterlessAPIRoutePath): string;
export function routeForApi(
  route: APIRoutePath,
  parameters?: APIRouteParameters,
  shouldEncode = true,
): string {
  const path = pathForApi(route, parameters, shouldEncode);

  return withBase(path, parameters?.namespace);
}
