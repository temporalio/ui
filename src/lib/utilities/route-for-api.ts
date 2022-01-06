type WorkflowsAPIRoutePath = 'workflows.open' | 'workflows.closed';
type WorkflowAPIRoutePath = 'workflow' | 'events';

type APIRoutePath = WorkflowsAPIRoutePath | WorkflowAPIRoutePath;

type APIRouteParameters = {
  namespace: string;
  executionId: string;
  runId: string;
};

type WorkflowListRouteParameters = Pick<APIRouteParameters, 'namespace'>;

export function routeForApi(
  route: WorkflowsAPIRoutePath,
  parameters: WorkflowListRouteParameters,
): string;
export function routeForApi(
  route: WorkflowAPIRoutePath,
  parameters: APIRouteParameters,
): string;
export function routeForApi(
  route: APIRoutePath,
  parameters: APIRouteParameters,
): string {
  const { namespace, executionId, runId } = parameters;

  const routes: { [K in APIRoutePath]: string } = {
    'workflows.open': `/namespaces/${namespace}/workflows/open`,
    'workflows.closed': `/namespaces/${namespace}/workflows/closed`,
    workflow: `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
    events: `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}/events`,
  };

  return routes[route];
}
