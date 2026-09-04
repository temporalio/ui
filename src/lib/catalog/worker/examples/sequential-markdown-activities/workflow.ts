import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.js';

const ACTIVITY_COUNT = 2_000;
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

export async function sequentialMarkdownActivities(): Promise<string[]> {
  const results: string[] = [];

  for (let step = 1; step <= ACTIVITY_COUNT; step += 1) {
    results.push(await logStep(step));
  }

  return results;
}
