import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  executionId: 'execution',
  runId: 'run',
};

describe(routeForApi, () => {
  it('should return a route for workflows.open', () => {
    expect(routeForApi('workflows.open', parameters)).toBe(
      '/namespaces/namespace/workflows/open',
    );
  });

  it('should return a route for workflows.closed', () => {
    expect(routeForApi('workflows.closed', parameters)).toBe(
      '/namespaces/namespace/workflows/closed',
    );
  });

  it('should return a route for workflow', () => {
    expect(routeForApi('workflow', parameters)).toBe(
      '/namespaces/namespace/workflows/execution/executions/run',
    );
  });

  it('should return a route for events', () => {
    expect(routeForApi('events', parameters)).toBe(
      '/namespaces/namespace/workflows/execution/executions/run/events',
    );
  });
});
