import { vi, afterEach, describe, test, expect } from 'vitest';
import { requestFromAPI } from '../utilities/request-from-api';
import { fetchAllWorkflows } from './workflow-service';

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
      const resp = await fetchAllWorkflows('test', {
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
});
