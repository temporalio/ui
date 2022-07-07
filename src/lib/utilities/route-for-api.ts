const replaceNamespaceInApiUrl = (
  apiUrl: string,
  namespace: string,
): string => {
  return apiUrl.replace('%namespace%', namespace);
};

const base = (namespace?: string): string => {
  let baseUrl = '';

  if (globalThis?.AppConfig?.apiUrl && namespace) {
    baseUrl = replaceNamespaceInApiUrl(globalThis.AppConfig.apiUrl, namespace);
  } else {
    baseUrl = import.meta.env.VITE_API;
  }

  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
  return baseUrl;
};

const withBase = (endpoint: string, namespace?: string): string => {
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1);
  return `${base(namespace)}/api/v1/${endpoint}`;
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
    },
  );
};

export function routeForApi(
  route: WorkflowsAPIRoutePath,
  parameters: WorkflowListRouteParameters,
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
  route: ScheduleAPIRoutePath,
  parameters: ScheduleRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(
  route: TaskQueueAPIRoutePath,
  parameters: TaskQueueRouteParameters,
  shouldEncode?: boolean,
): string;
export function routeForApi(route: ParameterlessAPIRoutePath): string;
export function routeForApi(
  route: APIRoutePath,
  parameters?: APIRouteParameters,
  shouldEncode = true,
): string {
  if (shouldEncode) parameters = encode(parameters);

  const routes: { [K in APIRoutePath]: string } = {
    cluster: '/cluster',
    settings: '/settings',
    user: '/me',
    namespaces: '/namespaces',
    'task-queue': `/namespaces/${parameters?.namespace}/task-queues/${parameters?.queue}`,
    workflows: `/namespaces/${parameters?.namespace}/workflows`,
    'workflows.archived': `/namespaces/${parameters?.namespace}/workflows/archived`,
    workflow: `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}`,
    'workflow.terminate': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/terminate`,
    'events.ascending': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/events`,
    'events.descending': `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/events/reverse`,
    query: `/namespaces/${parameters?.namespace}/workflows/${parameters?.workflowId}/runs/${parameters?.runId}/query`,
    schedules: `/namespaces/${parameters?.namespace}/schedules`,
    schedule: `/namespaces/${parameters?.namespace}/schedules/${parameters?.scheduleId}`,
    'schedule.delete': `/namespaces/${parameters?.namespace}/schedules/${parameters?.scheduleId}`,
  };

  return withBase(routes[route], parameters?.namespace);
}
