import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.js';

const DEFAULT_ACTIVITY_COUNT = 20;

const summaryForStep = (step: number): string =>
  step % 2 === 0
    ? `Checked step ${step}  \nStored [the result](https://temporal.io/blog)`
    : `Checked step ${step}\n\nStored [the result](https://temporal.io/blog)`;

const { recordMultilineActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export async function sequentialMultilineSummaryActivities(
  activityCount = DEFAULT_ACTIVITY_COUNT,
): Promise<string> {
  for (let step = 1; step <= activityCount; step += 1) {
    await recordMultilineActivity.executeWithOptions(
      { summary: summaryForStep(step) },
      [step],
    );
  }

  return `Completed ${activityCount} sequential activities`;
}
