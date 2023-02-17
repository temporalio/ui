import { page } from '$app/stores';
import { get } from 'svelte/store';
import { getApiOrigin } from './get-api-origin';
import { publicPath } from './get-public-path';

const replaceNamespaceInApiUrl = (
  apiUrl: string,
  namespace: string,
): string => {
  if (apiUrl) {
    return apiUrl.replace('%namespace%', namespace);
  }
  return '';
};

const base = (namespace?: string): string => {
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

  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  baseUrl = `${baseUrl}${publicPath}`;
  return baseUrl;
};

const withBase = (endpoint: string, namespace?: string): string => {
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1);
  const baseUrl = base(namespace);
  return `${baseUrl}/api/v1/${endpoint}`;
};

const encode = (parameters: APIRouteParameters): APIRouteParameters => {
  return Object.keys(parameters ?? {}).reduce(
    (acc, key) => {
      acc[key] = encodeURIComponent(encodeURIComponent(parameters[key]));
      return acc;
    },
    {
      namespace: '',
      workflowId: '',
      scheduleId: '',
      runId: '',
      queue: '',
      activityId: '',
    },
  );
};

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
  route: WorkflowAPIRoutePath,
  parameters: WorkflowRouteParameters,
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
  route: ParameterlessAPIRoutePath | SearchAttributesRoutePath,
): string;
export function routeForApi(
  route: APIRoutePath,
  parameters?: APIRouteParameters,
  shouldEncode = true,
): string {
  if (shouldEncode) parameters = encode(parameters);

  const routes: { [K in APIRoutePath]: string } = {
    cluster: '/cluster',
    'events.ascending': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/events`,
    'events.descending': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/events/reverse`,
    namespaces: '/namespaces',
    namespace: `/namespaces/${parameters?.namespace}`,
    query: `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/query`,
    'schedule.delete': `/namespaces/${parameters?.namespace}/schedules/${parameters?.scheduleId}`,
    schedule: `/namespaces/${parameters?.namespace}/schedules/${parameters?.scheduleId}`,
    schedules: `/namespaces/${parameters?.namespace}/schedules`,
    'search-attributes': '/search-attributes',
    settings: '/settings',
    'task-queue': `/namespaces/${parameters?.namespace}/task-queues/${parameters?.queue}`,
    user: '/me',
    'workflow.terminate': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/terminate`,
    'workflow.cancel': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/runs/${parameters.runId}/cancel`,
    'workflow.signal': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/runs/${parameters.runId}/signal`,
    'workflow.reset': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/runs/${parameters.runId}/reset`,
    workflow: `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}`,
    'workflows.archived': `/namespaces/${parameters?.namespace}/workflows/archived`,
    workflows: `/namespaces/${parameters?.namespace}/workflows`,
    'workflows.count': `/namespaces/${parameters?.namespace}/workflows/count`,
    'activity.complete': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/runs/${parameters.runId}/activities/${parameters.activityId}/complete`,
    'activity.fail': `/namespaces/${parameters.namespace}/workflows/${parameters.workflowId}/runs/${parameters.runId}/activities/${parameters.activityId}/fail`,
    'batch-operations': `/namespaces/${parameters.namespace}/batch-operations`,
    'batch-operation.describe': `/namespaces/${parameters.namespace}/batch-operations/describe`,
  };

  return withBase(routes[route], parameters?.namespace);
}
