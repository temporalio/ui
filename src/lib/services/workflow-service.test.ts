import { afterEach, describe, expect, test, vi } from 'vitest';

import { base } from '$app/paths';

import {
  fetchAllWorkflows,
  fetchInitialValuesForStartWorkflow,
  fetchWorkflowForRunId,
  startWorkflow,
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

vi.mock('./events-service', () => ({
  fetchInitialEvent: vi.fn().mockResolvedValue({ attributes: {} }),
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

  describe('startWorkflow', () => {
    test('encodes memo fields in the start request', async () => {
      await startWorkflow({
        namespace: 'test',
        workflowId: 'workflow-id',
        taskQueue: 'task-queue',
        workflowType: 'workflow-type',
        input: '',
        memo: '{"customer":"acme","attempt":3}',
        encoding: 'json/plain',
        messageType: '',
        summary: '',
        details: '',
        searchAttributes: [],
      });

      const requestOptions = vi.mocked(requestFromAPI).mock.calls[0]?.[1];
      const body = JSON.parse(String(requestOptions?.options?.body));

      expect(body.memo).toEqual({
        fields: {
          customer: {
            metadata: { encoding: 'anNvbi9wbGFpbg==' },
            data: 'ImFjbWUi',
          },
          attempt: {
            metadata: { encoding: 'anNvbi9wbGFpbg==' },
            data: 'Mw==',
          },
        },
      });
    });
  });

  describe('fetchInitialValuesForStartWorkflow', () => {
    test('decodes memo fields from the existing workflow', async () => {
      vi.mocked(requestFromAPI)
        .mockResolvedValueOnce({
          executions: [
            {
              execution: {
                workflowId: 'source-workflow',
                runId: 'source-run',
              },
            },
          ],
        })
        .mockResolvedValueOnce({
          workflowExecutionInfo: {
            execution: {
              workflowId: 'source-workflow',
              runId: 'source-run',
            },
            memo: {
              fields: {
                customer: {
                  metadata: { encoding: 'anNvbi9wbGFpbg==' },
                  data: 'ImFjbWUi',
                },
                attempt: {
                  metadata: { encoding: 'anNvbi9wbGFpbg==' },
                  data: 'Mw==',
                },
              },
            },
          },
        });

      const initialValues = await fetchInitialValuesForStartWorkflow({
        namespace: 'test',
        workflowId: 'source-workflow',
        runId: 'source-run',
      });

      expect(JSON.parse(initialValues.memo)).toEqual({
        customer: 'acme',
        attempt: 3,
      });
    });
  });
});
