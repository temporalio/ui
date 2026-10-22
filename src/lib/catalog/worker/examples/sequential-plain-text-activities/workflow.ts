import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.js';

const DEFAULT_ACTIVITY_COUNT = 20;

const { recordActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export async function sequentialPlainTextActivities(
  activityCount = DEFAULT_ACTIVITY_COUNT,
): Promise<string> {
  for (let index = 1; index <= activityCount; index += 1) {
    await recordActivity.executeWithOptions({ summary: `Activity ${index}` }, [
      index,
    ]);
  }

  return `Completed ${activityCount} sequential activities`;
}
