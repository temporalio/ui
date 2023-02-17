import { writable } from 'svelte/store';
import { beforeEach, afterEach, describe, test, expect, vi } from 'vitest';

import { requestFromAPI } from '../utilities/request-from-api';
import { temporalVersion } from '../stores/versions';
import { bulkTerminateByIDs, bulkCancelByIDs } from './batch-service';

const mockWorkflows = [
  { id: '1', runId: 'a' },
  { id: '2', runId: 'b' },
  { id: '3', runId: 'c' },
];

vi.mock('../utilities/request-from-api', () => ({
  requestFromAPI: vi.fn().mockResolvedValue({ jobId: 'abc-123' }),
}));

vi.mock('uuid', () => ({
  v4: () => 'xxx',
}));

vi.mock('../stores/versions', () => {
  return {
    temporalVersion: writable(),
  };
});

describe('Batch Service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when temporal server version is <= 1.19', () => {
    beforeEach(() => {
      vi.spyOn(temporalVersion, 'subscribe').mockImplementation(
        (fn) => () => fn('1.19'),
      );
    });

    test('bulkTerminateByIDs calls the create batch operation endpoint with the correct options', async () => {
      await bulkTerminateByIDs({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations',
        {
          notifyOnError: false,
          shouldRetry: false,
          options: {
            method: 'POST',
            body: '{"jobId":"xxx","namespace":"default","reason":"test","terminationOperation":{},"visibilityQuery":"RunId=\\"a\\" OR RunId=\\"b\\" OR RunId=\\"c\\""}',
          },
        },
      );
    });

    test('bulkCancelByIDs calls the create batch operation endpoint with the correct options', async () => {
      await bulkCancelByIDs({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations',
        {
          notifyOnError: false,
          shouldRetry: false,
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

    test('bulkTerminateByIDs calls the create batch operation endpoint with the correct options', async () => {
      await bulkTerminateByIDs({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations',
        {
          notifyOnError: false,
          shouldRetry: false,
          options: {
            method: 'POST',
            body: '{"jobId":"xxx","namespace":"default","reason":"test","terminationOperation":{},"executions":[{"workflowId":"1","runId":"a"},{"workflowId":"2","runId":"b"},{"workflowId":"3","runId":"c"}]}',
          },
        },
      );
    });

    test('bulkCancelByIDs calls the create batch operation endpoint with the correct options', async () => {
      await bulkCancelByIDs({
        namespace: 'default',
        reason: 'test',
        workflows: mockWorkflows,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        'http://localhost:8233/api/v1/namespaces/default/batch-operations',
        {
          notifyOnError: false,
          shouldRetry: false,
          options: {
            method: 'POST',
            body: '{"jobId":"xxx","namespace":"default","reason":"test","cancellationOperation":{},"executions":[{"workflowId":"1","runId":"a"},{"workflowId":"2","runId":"b"},{"workflowId":"3","runId":"c"}]}',
          },
        },
      );
    });
  });
});
