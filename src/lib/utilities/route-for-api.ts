import { namespaceUrlPattern } from './namespace-url-pattern';

let base = (import.meta.env?.VITE_API as string) ?? process.env.VITE_API;
if (base.endsWith('/')) base = base.slice(0, -1);

// const RealBaseUrl = `https://web.${namespaceUrlPattern.match(window.location.pathname).namespace
//   }.tmprl.cloud/api/v1/`;

const withBase = (endpoint: string): string => {
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1);
  return `${base}/api/v1/${endpoint}`;

  // return `${RealBaseUrl}${endpoint}`;
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
  route: WorkflowAPIRoutePath,
  parameters: WorkflowRouteParameters,
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
  };

  return withBase(routes[route]);
}
