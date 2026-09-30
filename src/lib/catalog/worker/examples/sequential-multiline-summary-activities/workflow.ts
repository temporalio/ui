import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.js';

const DEFAULT_ACTIVITY_COUNT = 20;

const checkedLine = (step: number): string =>
  step % 3 === 0
    ? `Checked step ${step} against the upstream inventory service, reconciled every pending reservation, and confirmed that each downstream warehouse acknowledged the updated allocation before continuing`
    : `Checked step ${step}`;

const storedLine = (step: number): string =>
  step % 4 === 0
    ? 'Stored [the result](https://temporal.io/blog) in the audit ledger with a full snapshot of the request payload, the resolved configuration, and the identifiers needed to replay this step later'
    : 'Stored [the result](https://temporal.io/blog)';

const summaryForStep = (step: number): string =>
  step % 2 === 0
    ? `${checkedLine(step)}  \n${storedLine(step)}`
    : `${checkedLine(step)}\n\n${storedLine(step)}`;

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
