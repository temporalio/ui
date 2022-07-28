import { describe, expect, it, vi } from 'vitest';
import { routeForApi } from './route-for-api';

const parameters = {
  namespace: 'namespace',
  workflowId: 'workflow',
  runId: 'run',
  queue: 'queue',
};

vi.stubGlobal('AppConfig', {
  apiUrl: 'https://api.url/',
});

describe('routeForApi with AppConfig.apiUrl', () => {
  it('should return a route for workflow', () => {
    expect(routeForApi('workflow', parameters)).toBe(
      'https://api.url/api/v1/namespaces/namespace/workflows/workflow/runs/run',
    );
  });
});
