import { proxyActivities, workflowInfo } from '@temporalio/workflow';

import type * as activities from './activity.js';

const MAX_EVENTS_PER_ACTIVITY = 6;
const EVENTS_PER_BATCH = 1;
const CLOSING_EVENTS = 2;

const { largeHistoryStep } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export async function largeHistory(
  targetEventCount = 10_000,
  batchSize = 100,
): Promise<string> {
  let activityCount = 0;

  for (;;) {
    const remainingEvents =
      targetEventCount -
      workflowInfo().historyLength -
      CLOSING_EVENTS -
      EVENTS_PER_BATCH;
    const size = Math.min(
      batchSize,
      Math.floor(remainingEvents / MAX_EVENTS_PER_ACTIVITY),
    );

    if (size < 1) break;

    await Promise.all(
      Array.from({ length: size }, (_, index) =>
        largeHistoryStep(activityCount + index),
      ),
    );
    activityCount += size;
  }

  return `LARGE HISTORY: ${activityCount} activities completed with ${workflowInfo().historyLength + CLOSING_EVENTS} of ${targetEventCount} target events`;
}
