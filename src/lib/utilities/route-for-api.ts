let base = (import.meta.env?.VITE_API as string) ?? process.env.VITE_API;
if (base.endsWith('/')) base = base.slice(0, -1);

const withBase = (endpoint: string): string => {
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1);
  return `${base}/api/v1/${endpoint}`;
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
  const encoded: APIRouteParameters = Object.keys(parameters ?? {}).reduce(
    (acc, key) => {
      acc[key] = encodeURIComponent(encodeURIComponent(parameters[key]));
      return acc;
    },
    {
      namespace: '',
      workflowId: '',
      runId: '',
      queue: '',
    },
  );

  const routes: { [K in APIRoutePath]: string } = {
    cluster: '/cluster',
    settings: '/settings',
    user: '/me',
    namespaces: '/namespaces',
    'task-queue': `/namespaces/${encoded?.namespace}/task-queues/${encoded?.queue}`,
    workflows: `/namespaces/${encoded?.namespace}/workflows`,
    'workflows.archived': `/namespaces/${encoded?.namespace}/workflows/archived`,
    workflow: `/namespaces/${encoded?.namespace}/workflows/${encoded?.workflowId}/runs/${encoded?.runId}`,
    'workflow.terminate': `/namespaces/${encoded?.namespace}/workflows/${encoded?.workflowId}/runs/${encoded?.runId}/terminate`,
    'events.ascending': `/namespaces/${encoded?.namespace}/workflows/${encoded?.workflowId}/runs/${encoded?.runId}/events`,
    'events.descending': `/namespaces/${encoded?.namespace}/workflows/${encoded?.workflowId}/runs/${encoded?.runId}/events/reverse`,
    query: `/namespaces/${encoded?.namespace}/workflows/${encoded?.workflowId}/runs/${encoded?.runId}/query`,
  };

  return withBase(routes[route]);
}
