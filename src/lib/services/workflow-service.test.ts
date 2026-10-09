import { get } from 'svelte/store';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { base } from '$app/paths';

import { translate } from '$lib/i18n/translate';
import { workflowError } from '$lib/stores/workflows';
import type { ErrorCallback } from '$lib/utilities/request-from-api';

import {
  fetchAllWorkflows,
  fetchPaginatedWorkflows,
  fetchWorkflowForRunId,
} from './workflow-service';
import { getApiOrigin } from '../utilities/get-api-origin';
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

const origin = getApiOrigin();

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
        `${origin}${base}/api/v1/namespaces/test/workflows`,
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
        `${origin}${base}/api/v1/namespaces/test/workflows`,
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

  describe('fetchPaginatedWorkflows', () => {
    test('sets a permission message on 403', async () => {
      const fetchPage = await fetchPaginatedWorkflows('test');
      await fetchPage();

      const { onError } = vi.mocked(requestFromAPI).mock.calls[0][1] as {
        onError: ErrorCallback;
      };
      onError({
        status: 403,
        statusText: 'Forbidden',
        body: { code: 7, message: 'Request unauthorized.', details: [] },
      });

      expect(get(workflowError)).toBe(
        translate('common.permission-denied-description'),
      );
    });
  });
});
