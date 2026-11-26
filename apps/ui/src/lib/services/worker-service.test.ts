import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  fetchWorkerCountByStatus,
  sumWorkerStatusCounts,
  toWorkerStatusQuery,
} from './worker-service';
import { requestFromAPI } from '../utilities/request-from-api';

vi.mock('../utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

const namespace = 'test-namespace';

describe('worker service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('toWorkerStatusQuery', () => {
    test('returns only the status clause without an existing query', () => {
      expect(toWorkerStatusQuery('Running')).toBe('`WorkerStatus`="Running"');
    });

    test('wraps an existing query so it is not broken up by the status clause', () => {
      expect(
        toWorkerStatusQuery('ShuttingDown', 'TaskQueue="a" OR TaskQueue="b"'),
      ).toBe(
        '(TaskQueue="a" OR TaskQueue="b") AND `WorkerStatus`="ShuttingDown"',
      );
    });
  });

  describe('sumWorkerStatusCounts', () => {
    test('adds up the statuses that returned a count', () => {
      expect(
        sumWorkerStatusCounts([
          { status: 'Running', count: 12 },
          { status: 'ShuttingDown', count: 3 },
        ]),
      ).toBe(15);
    });

    test('ignores statuses without a count', () => {
      expect(
        sumWorkerStatusCounts([
          { status: 'Running', count: 12 },
          { status: 'ShuttingDown', count: undefined },
        ]),
      ).toBe(12);
    });

    test('returns undefined when no status returned a count', () => {
      expect(
        sumWorkerStatusCounts([
          { status: 'Running', count: undefined },
          { status: 'ShuttingDown', count: undefined },
        ]),
      ).toBeUndefined();
    });

    test('returns undefined when there are no counts at all', () => {
      expect(sumWorkerStatusCounts([])).toBeUndefined();
    });
  });

  describe('fetchWorkerCountByStatus', () => {
    test('requests a count per status and returns parsed counts', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce({ count: '12' });
      vi.mocked(requestFromAPI).mockResolvedValueOnce({ count: '3' });

      const counts = await fetchWorkerCountByStatus({ namespace }, vi.fn());

      expect(counts).toEqual([
        { status: 'Running', count: 12 },
        { status: 'ShuttingDown', count: 3 },
      ]);
      expect(requestFromAPI).toHaveBeenCalledTimes(2);
      expect(vi.mocked(requestFromAPI).mock.calls[0][1]).toMatchObject({
        params: { query: '`WorkerStatus`="Running"' },
      });
      expect(vi.mocked(requestFromAPI).mock.calls[1][1]).toMatchObject({
        params: { query: '`WorkerStatus`="ShuttingDown"' },
      });
    });

    test('combines the status with the current query', async () => {
      vi.mocked(requestFromAPI).mockResolvedValue({ count: '1' });

      await fetchWorkerCountByStatus(
        { namespace, query: 'TaskQueue="hello"' },
        vi.fn(),
      );

      expect(vi.mocked(requestFromAPI).mock.calls[0][1]).toMatchObject({
        params: {
          query: '(TaskQueue="hello") AND `WorkerStatus`="Running"',
        },
      });
    });

    test('returns undefined counts when the request fails', async () => {
      vi.mocked(requestFromAPI).mockRejectedValue(new Error('nope'));

      const counts = await fetchWorkerCountByStatus({ namespace }, vi.fn());

      expect(counts).toEqual([
        { status: 'Running', count: undefined },
        { status: 'ShuttingDown', count: undefined },
      ]);
    });
  });
});
