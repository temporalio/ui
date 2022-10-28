import { describe, expect, it, vi } from 'vitest';
import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  workflowId: 'workflow',
  runId: 'run',
  queue: 'queue',
};

describe('routeForApi with GetNamespaces', () => {
  it('should return a route for workflow', async () => {
    const route = await routeForApi('workflow', parameters);
    expect(route).toBe(
      'https://api.url/api/v1/namespaces/namespace/workflows/workflow/runs/run',
    );
  });
});
