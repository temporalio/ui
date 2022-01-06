type WorkflowsAPIRoutePath = 'workflows.open' | 'workflows.closed';
type WorkflowAPIRoutePath = 'workflow' | 'workflow.terminate' | 'events';
type TaskQueueAPIRoutePath = 'task-queue';
type ParameterlessAPIRoutePath = 'cluster' | 'settings' | 'user' | 'namespaces';

type APIRoutePath =
  | WorkflowsAPIRoutePath
  | WorkflowAPIRoutePath
  | ParameterlessAPIRoutePath
  | TaskQueueAPIRoutePath;

type APIRouteParameters = {
  namespace: string;
  executionId: string;
  runId: string;
  queue: string;
};

type WorkflowListRouteParameters = Pick<APIRouteParameters, 'namespace'>;
type WorkflowRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'executionId' | 'runId'
>;
type TaskQueueRouteParameters = Pick<APIRouteParameters, 'namespace' | 'queue'>;

const base = import.meta.env?.VITE_API || process.env.VITE_API;

console.log({ base });

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
    'workflows.open': `/namespaces/${parameters?.namespace}/workflows/open`,
    'workflows.closed': `/namespaces/${parameters?.namespace}/workflows/closed`,
    workflow: `/namespaces/${parameters?.namespace}/workflows/${parameters?.executionId}/executions/${parameters?.runId}`,
    'workflow.terminate': `/namespaces/${parameters?.namespace}/workflows/${parameters?.executionId}/executions/${parameters?.runId}/terminate`,
    events: `/namespaces/${parameters?.namespace}/workflows/${parameters?.executionId}/executions/${parameters?.runId}/events`,
  };

  return withBase(routes[route]);
}
