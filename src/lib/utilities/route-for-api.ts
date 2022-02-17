let base = (import.meta.env?.VITE_API as string) ?? process.env.VITE_API;
if (base.endsWith('/')) base = base.slice(0, -1);

const encode = (component: string): string => {
  return component
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

const withBase = (endpoint: string): string => {
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1);
  return `${base}/api/v1/${encode(endpoint)}`;
};

export function routeForApi(
  route: WorkflowsAPIRoutePath,
  parameters: WorkflowListRouteParameters,
): string;
export function routeForApi(
  route: WorkflowAPIRoutePath,
  parameters: WorkflowRouteParameters,
): string;
export function routeForApi(
  route: TaskQueueAPIRoutePath,
  parameters: TaskQueueRouteParameters,
): string;
export function routeForApi(route: ParameterlessAPIRoutePath): string;
export function routeForApi(
  route: APIRoutePath,
  parameters?: APIRouteParameters,
): string {
  const routes: { [K in APIRoutePath]: string } = {
    cluster: '/cluster',
    settings: '/settings',
    user: '/me',
    namespaces: '/namespaces',
    'task-queue': `/namespaces/${parameters?.namespace}/task-queues/${parameters?.queue}`,
    workflows: `/namespaces/${parameters?.namespace}/workflows`,
    'workflows.archived': `/namespaces/${parameters?.namespace}/workflows/archived`,
    workflow: `/namespaces/${parameters?.namespace}/workflows/${parameters?.executionId}/executions/${parameters?.runId}`,
    'workflow.terminate': `/namespaces/${parameters?.namespace}/workflows/${parameters?.executionId}/executions/${parameters?.runId}/terminate`,
    events: `/namespaces/${parameters?.namespace}/workflows/${parameters?.executionId}/executions/${parameters?.runId}/events`,
    query: `/namespaces/${parameters?.namespace}/workflows/${parameters?.executionId}/executions/${parameters?.runId}/query`,
  };

  return withBase(routes[route]);
}
