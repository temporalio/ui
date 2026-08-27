import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.js';

const ACTIVITY_COUNT = 2_000;

const { recordActivityWithoutSummary } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export async function sequentialNoSummaryActivities(): Promise<string> {
  for (let index = 1; index <= ACTIVITY_COUNT; index += 1) {
    await recordActivityWithoutSummary(index);
  }

  return `Completed ${ACTIVITY_COUNT} sequential activities without summaries`;
}
