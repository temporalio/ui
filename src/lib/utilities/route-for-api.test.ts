import { ApiRoutes } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  workflowId: 'workflow',
  runId: 'run',
  queue: 'queue',
};
const { namespace, workflowId, runId, queue } = parameters;

// We're going to use this object because it doesn't have queue
// In our app typescript would cause errors and prevent urlcat filling
// out the params on these urls, but since ts isn't working here
const workflowRouteParams = { namespace, workflowId, runId };

describe('ApiRoutes', () => {
  it('should return a route for workflow', () => {
    expect(ApiRoutes.workflow(workflowRouteParams)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run',
    );
  });

  it('should return a route for events', () => {
    expect(ApiRoutes.events(workflowRouteParams)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run/events',
    );
  });

  it('should return a route for task-queue', () => {
    expect(ApiRoutes['task-queue']({ namespace, queue })).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/task-queues/queue',
    );
  });

  it("Should throw when path parameters aren't filled", () => {
    expect(() => {
      ApiRoutes['task-queue']({ namespace });
    }).toThrow();
  });

  it('should return a route for cluster', () => {
    expect(ApiRoutes.cluster()).toBe('http://localhost:8080/api/v1/cluster');
  });

  it('should return a route for settings', () => {
    expect(ApiRoutes.settings()).toBe('http://localhost:8080/api/v1/settings');
  });

  it('should return a route for user', () => {
    expect(ApiRoutes.user()).toBe('http://localhost:8080/api/v1/me');
  });

  it('should return a route for workflow.terminate', () => {
    expect(ApiRoutes['workflow.terminate'](workflowRouteParams)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run/terminate',
    );
  });
});

describe('API Request Encoding', () => {
  it('should return a route for workflow', () => {
    expect(
      ApiRoutes.workflow({
        ...workflowRouteParams,
        workflowId: 'worflow#with#hashes',
      }),
    ).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/worflow%23with%23hashes/runs/run',
    );
  });
});
