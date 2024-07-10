import { describe, expect, it } from 'vitest';

import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  workflowId: 'workflow',
  runId: 'run',
  queue: 'queue',
};

describe('routeForApi', () => {
  it('should return a route for workflow', () => {
    const route = routeForApi('workflow', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow',
    );
  });

  it('should return a route for events', () => {
    const route = routeForApi('events.ascending', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow/history',
    );
  });

  it('should return a route for events', () => {
    const route = routeForApi('events.descending', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow/history-reverse',
    );
  });

  it('should return a route for task-queue', () => {
    const route = routeForApi('task-queue', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/task-queues/queue',
    );
  });

  it('should return a route for cluster', () => {
    const route = routeForApi('cluster');
    expect(route).toBe('http://localhost:8233/api/v1/cluster-info');
  });

  it('should return a route for settings', () => {
    const route = routeForApi('settings');
    expect(route).toBe('http://localhost:8233/api/v1/settings');
  });

  it('should return a route for user', () => {
    const route = routeForApi('user');
    expect(route).toBe('http://localhost:8233/api/v1/me');
  });

  it('should return a route for workflow', () => {
    const parameters = {
      namespace: 'namespace',
      workflowId: 'workflow',
    };

    const route = routeForApi('workflow', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow',
    );
  });

  it('should return a route for workflow without a runId even if passed as a parameter', () => {
    const parameters = {
      namespace: 'namespace',
      workflowId: 'workflow',
      runId: 'run',
    };

    const route = routeForApi('workflow', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow',
    );
  });

  it('should return a route for workflow without a runId even if passed as a parameter', () => {
    const parameters = {
      namespace: 'namespace',
      workflowId: 'workflow',
      runId: 'run',
    };

    const route = routeForApi('workflow', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow',
    );
  });

  it('should return a route for workflow.terminate', () => {
    const route = routeForApi('workflow.terminate', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow/terminate',
    );
  });

  it('should return a route for workflow.cancel', () => {
    const route = routeForApi('workflow.cancel', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow/cancel',
    );
  });

  it('should return a route for workflow.reset', () => {
    const route = routeForApi('workflow.reset', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow/reset',
    );
  });

  it('should return a route for workflow.signal', () => {
    const parameters = {
      namespace: 'namespace',
      workflowId: 'workflow',
      runId: 'run',
      signalName: 'signalName',
    };

    const route = routeForApi('workflow.signal', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow/signal/signalName',
    );
  });

  it('should return a route for list of schedules', () => {
    const parameters = {
      namespace: 'namespace',
    };

    const route = routeForApi('schedules', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/schedules',
    );
  });

  it('should return a route for a schedule', () => {
    const parameters = {
      namespace: 'namespace',
      scheduleId: 'scheduleName',
    };

    const route = routeForApi('schedule', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/schedules/scheduleName',
    );
  });

  it('should return a route for editing schedule', () => {
    const parameters = {
      namespace: 'namespace',
      scheduleId: 'scheduleName',
    };

    const route = routeForApi('schedule.edit', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/schedules/scheduleName/update',
    );
  });

  it('should return a route for patching schedule', () => {
    const parameters = {
      namespace: 'namespace',
      scheduleId: 'scheduleName',
    };

    const route = routeForApi('schedule.patch', parameters);
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/schedules/scheduleName/patch',
    );
  });
});

describe('API Request Encoding', () => {
  it('should return a route for workflow', () => {
    const route = routeForApi('workflow', {
      ...parameters,
      workflowId: 'workflow#with#hashes',
    });
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/namespace/workflows/workflow%23with%23hashes',
    );
  });

  it('should handle slashes', () => {
    const route = routeForApi('workflow', {
      ...parameters,
      namespace: 'canary',
      runId: '47e33895-aff5-475a-9b53-73abdee8bebe',
      workflowId:
        'temporal.canary.cron-workflow.sanity-2022-05-02T16:03:11-06:00/workflow.advanced-visibility.scan',
    });
    expect(route).toBe(
      'http://localhost:8233/api/v1/namespaces/canary/workflows/temporal.canary.cron-workflow.sanity-2022-05-02T16%3A03%3A11-06%3A00%2Fworkflow.advanced-visibility.scan',
    );
  });
});
