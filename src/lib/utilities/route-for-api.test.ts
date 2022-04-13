import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  workflowId: 'workflow',
  runId: 'run',
  queue: 'queue',
};

describe(routeForApi, () => {
  it('should return a route for workflow', () => {
    expect(routeForApi('workflow', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run',
    );
  });

  it('should return a route for events', () => {
    expect(routeForApi('events', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run/events',
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

  it('should return a route for workflow.terminate', () => {
    expect(routeForApi('workflow.terminate', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run/terminate',
    );
  });
});

describe('API Request Encoding', () => {
  it('should return a route for workflow', () => {
    expect(
      routeForApi('workflow', {
        ...parameters,
        workflowId: 'worflow#with#hashes',
      }),
    ).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/worflow%2523with%2523hashes/runs/run',
    );
  });
});
