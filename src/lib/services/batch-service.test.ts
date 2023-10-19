import { writable } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { batchCancelWorkflows, batchTerminateWorkflows } from './batch-service';
import { temporalVersion } from '../stores/versions';
import { requestFromAPI } from '../utilities/request-from-api';

const mockWorkflows = [
  { id: '1', runId: 'a' },
  { id: '2', runId: 'b' },
  { id: '3', runId: 'c' },
];

vi.mock('../utilities/request-from-api', () => ({
  requestFromAPI: vi.fn().mockImplementation((route) => {
    if (route.includes('/describe')) {
      return new Promise((resolve) =>
        resolve({ state: 'Completed', completedOperationCount: '10' }),
      );
    }

    return new Promise((resolve) => resolve('xxx'));
  }),
}));

vi.mock('../stores/versions', () => {
  return {
    temporalVersion: writable(),
  };
});

describe('Batch Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when temporal server version is <= 1.19', () => {
    beforeEach(() => {
      vi.spyOn(temporalVersion, 'subscribe').mockImplementation(
        (fn) => () => fn('1.19'),
      );
    });

    test('batchTerminateWorkflows calls the create batch operation endpoint with the correct options', async () => {
      await batchTerminateWorkflows({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
        jobId: 'xxx',
      });

      expect(requestFromAPI).toHaveBeenCalledTimes(2);
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations/xxx',
        {
          notifyOnError: false,
          options: {
            method: 'POST',
            body: '{"jobId":"xxx","namespace":"default","reason":"test","terminationOperation":{},"visibilityQuery":"RunId=\\"a\\" OR RunId=\\"b\\" OR RunId=\\"c\\""}',
          },
        },
      );
    });

    test('batchCancelWorkflows calls the create batch operation endpoint with the correct options', async () => {
      await batchCancelWorkflows({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
        jobId: 'xxx',
      });

      expect(requestFromAPI).toHaveBeenCalledTimes(2);
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations/xxx',
        {
          notifyOnError: false,
          options: {
            method: 'POST',
            body: '{"jobId":"xxx","namespace":"default","reason":"test","cancellationOperation":{},"visibilityQuery":"RunId=\\"a\\" OR RunId=\\"b\\" OR RunId=\\"c\\""}',
          },
        },
      );
    });
  });

  describe('when temporal server version is > 1.19', () => {
    beforeEach(() => {
      vi.spyOn(temporalVersion, 'subscribe').mockImplementation(
        (fn) => () => fn('1.20'),
      );
    });

    test('batchTerminateWorkflows calls the create batch operation endpoint with the correct options', async () => {
      await batchTerminateWorkflows({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
        jobId: 'xxx',
      });

      expect(requestFromAPI).toHaveBeenCalledTimes(2);
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations/xxx',
        {
          notifyOnError: false,
          options: {
            method: 'POST',
            body: '{"jobId":"xxx","namespace":"default","reason":"test","terminationOperation":{},"executions":[{"workflowId":"1","runId":"a"},{"workflowId":"2","runId":"b"},{"workflowId":"3","runId":"c"}]}',
          },
        },
      );
    });

    test('batchCancelWorkflows calls the create batch operation endpoint with the correct options', async () => {
      await batchCancelWorkflows({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
        jobId: 'xxx',
      });

      expect(requestFromAPI).toHaveBeenCalledTimes(2);
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations/xxx',
        {
          notifyOnError: false,
          options: {
            method: 'POST',
            body: '{"jobId":"xxx","namespace":"default","reason":"test","cancellationOperation":{},"executions":[{"workflowId":"1","runId":"a"},{"workflowId":"2","runId":"b"},{"workflowId":"3","runId":"c"}]}',
          },
        },
      );
    });
  });
});
