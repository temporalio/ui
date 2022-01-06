import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  executionId: 'execution',
  runId: 'run',
  queue: 'queue',
};

describe(routeForApi, () => {
  it('should return a route for workflows.open', () => {
    expect(routeForApi('workflows.open', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/open',
    );
  });

  it('should return a route for workflows.closed', () => {
    expect(routeForApi('workflows.closed', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/closed',
    );
  });

  it('should return a route for workflow', () => {
    expect(routeForApi('workflow', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/execution/executions/run',
    );
  });

  it('should return a route for events', () => {
    expect(routeForApi('events', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/execution/executions/run/events',
    );
  });

  it('should return a route for task-queue', () => {
    expect(routeForApi('task-queue', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/task-queues/queue',
    );
  });

  it('should return a route for cluster', () => {
    expect(routeForApi('cluster')).toBe('http://localhost:8080/api/v1/cluster');
  });

  it('should return a route for settings', () => {
    expect(routeForApi('settings')).toBe(
      'http://localhost:8080/api/v1/settings',
    );
  });

  it('should return a route for user', () => {
    expect(routeForApi('user')).toBe('http://localhost:8080/api/v1/me');
  });
});
