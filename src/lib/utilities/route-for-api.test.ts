/**
 * @jest-environment jsdom
 */

import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  workflowId: 'workflow',
  runId: 'run',
  queue: 'queue',
};

describe(routeForApi, () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return a route for workflow', () => {
    expect(routeForApi('workflow', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run',
    );
  });

  it('should return a route for events', () => {
    expect(routeForApi('events.ascending', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run/events',
    );
  });

  it('should return a route for events', () => {
    expect(routeForApi('events.descending', parameters)).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow/runs/run/events/reverse',
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
        workflowId: 'workflow#with#hashes',
      }),
    ).toBe(
      'http://localhost:8080/api/v1/namespaces/namespace/workflows/workflow%2523with%2523hashes/runs/run',
    );
  });

  it('should handle slashes', () => {
    expect(
      routeForApi('workflow', {
        ...parameters,
        namespace: 'canary',
        runId: '47e33895-aff5-475a-9b53-73abdee8bebe',
        workflowId:
          'temporal.canary.cron-workflow.sanity-2022-05-02T16:03:11-06:00/workflow.advanced-visibility.scan',
      }),
    ).toBe(
      'http://localhost:8080/api/v1/namespaces/canary/workflows/temporal.canary.cron-workflow.sanity-2022-05-02T16%253A03%253A11-06%253A00%252Fworkflow.advanced-visibility.scan/runs/47e33895-aff5-475a-9b53-73abdee8bebe',
    );
  });
});
