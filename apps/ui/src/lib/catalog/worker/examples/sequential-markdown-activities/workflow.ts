import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.js';

const DEFAULT_ACTIVITY_COUNT = 20;
const ACTIVITY_SUMMARY = '[Logging System](https://temporal.io/blog)';

const { logStep } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  summary: ACTIVITY_SUMMARY,
  retry: {
    maximumAttempts: 4,
    initialInterval: '1 second',
    maximumInterval: '4 seconds',
    backoffCoefficient: 2,
  },
});

export async function sequentialMarkdownActivities(
  activityCount = DEFAULT_ACTIVITY_COUNT,
): Promise<string[]> {
  const results: string[] = [];

  for (let step = 1; step <= activityCount; step += 1) {
    results.push(await logStep(step));
  }

  return results;
}
