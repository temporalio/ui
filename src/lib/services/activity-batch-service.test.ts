import { afterEach, describe, expect, test, vi } from 'vitest';

import { base } from '$app/paths';

import type { ActivityExecutionInfo } from '$lib/types/activity-execution';

import {
  batchCancelActivities,
  batchTerminateActivities,
} from './activity-batch-service';
import { getApiOrigin } from '../utilities/get-api-origin';
import { requestFromAPI } from '../utilities/request-from-api';

const mockActivities = [
  { activityId: '1', runId: 'a' },
  { activityId: '2', runId: 'b' },
] as unknown as ActivityExecutionInfo[];

const origin = getApiOrigin();

vi.mock('../utilities/request-from-api', () => ({
  requestFromAPI: vi.fn().mockResolvedValue('xxx'),
}));

describe('Activity Batch Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('batchTerminateActivities calls the create batch operation endpoint with the identity and target executions', async () => {
    await batchTerminateActivities({
      namespace: 'default',
      reason: 'test',
      activities: mockActivities,
      jobId: 'xxx',
      identity: 'test@temporal.io',
    });

    expect(requestFromAPI).toHaveBeenCalledTimes(2);
    expect(requestFromAPI).toHaveBeenCalledWith(
      `${origin}${base}/api/v1/namespaces/default/batch-operations/xxx`,
      {
        notifyOnError: false,
        options: {
          method: 'POST',
          body: '{"jobId":"xxx","namespace":"default","reason":"test","terminateActivitiesOperation":{"identity":"test@temporal.io","reason":"test"},"targetExecutions":[{"type":2,"businessId":"1","runId":"a"},{"type":2,"businessId":"2","runId":"b"}]}',
        },
      },
    );
  });

  test('batchCancelActivities omits identity when it is undefined and uses the visibility query', async () => {
    await batchCancelActivities({
      namespace: 'default',
      reason: 'test',
      query: 'ActivityType="foo"',
      jobId: 'xxx',
    });

    expect(requestFromAPI).toHaveBeenCalledTimes(2);
    expect(requestFromAPI).toHaveBeenCalledWith(
      `${origin}${base}/api/v1/namespaces/default/batch-operations/xxx`,
      {
        notifyOnError: false,
        options: {
          method: 'POST',
          body: '{"jobId":"xxx","namespace":"default","reason":"test","cancelActivitiesOperation":{"reason":"test"},"visibilityQuery":"ActivityType=\\"foo\\""}',
        },
      },
    );
  });
});
