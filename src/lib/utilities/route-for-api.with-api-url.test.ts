import { describe, expect, it, vi } from 'vitest';
import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  workflowId: 'workflow',
  runId: 'run',
  queue: 'queue',
};

vi.stubGlobal('AppConfig', async () => {
  return {
    namespace: 'namespace',
    webUrl: 'https://api.url/',
  }
});

describe('routeForApi with GetNamespaces', () => {
  it('should return a route for workflow', () => {
    const route = routeForApi('workflow', parameters);
    expect(route).toBe(
      'https://api.url/api/v1/namespaces/namespace/workflows/workflow/runs/run',
    );
  });
});
