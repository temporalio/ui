import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.js';

const DEFAULT_ACTIVITY_COUNT = 20;

const { recordActivityWithoutSummary } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export async function sequentialNoSummaryActivities(
  activityCount = DEFAULT_ACTIVITY_COUNT,
): Promise<string> {
  for (let index = 1; index <= activityCount; index += 1) {
    await recordActivityWithoutSummary(index);
  }

  return `Completed ${activityCount} sequential activities without summaries`;
}
