import { afterEach, describe, expect, test, vi } from 'vitest';

import { fetchAllWorkflows, fetchWorkflowForRunId } from './workflow-service';
import { requestFromAPI } from '../utilities/request-from-api';

vi.mock('../utilities/request-from-api', () => ({
  requestFromAPI: vi.fn().mockImplementation(
    () =>
      new Promise((resolve) =>
        resolve({
          executions: [],
          nextPageToken: '',
        }),
      ),
  ),
}));

describe('workflow service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllWorkflows', () => {
    test('preserves queries with "%"', async () => {
      await fetchAllWorkflows('test', {
        query: 'WorkflowType LIKE "cron%"',
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/test/workflows',
        {
          handleError: expect.any(Function),
          onError: expect.any(Function),
          params: {
            query: 'WorkflowType LIKE "cron%"',
          },
          request: expect.any(Function),
        },
      );
    });
  });

  describe('fetchWorkflowForRunId', () => {
    test('is called with the correct params', async () => {
      const workflowId = 'temporal.test%';
      await fetchWorkflowForRunId({ namespace: 'test', workflowId });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/test/workflows',
        {
          params: {
            query: `WorkflowId="${workflowId}"`,
            pageSize: '1',
          },
          request: expect.any(Function),
        },
      );
    });
  });
});
