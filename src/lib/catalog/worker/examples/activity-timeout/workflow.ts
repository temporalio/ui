import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activity.js';

const { timeoutActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 second',
  scheduleToStartTimeout: '1 second',
  retry: { maximumAttempts: 1 },
});

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const hasFailureName = (error: unknown, expectedName: string): boolean => {
  let current = error;

  while (current instanceof Error) {
    if (current.name === expectedName) return true;
    current = current.cause;
  }

  return false;
};

export async function timeoutWorkflow(shouldTimeout = true): Promise<string> {
  const startedAt = Date.now();

  try {
    const result = await timeoutActivity(startedAt, shouldTimeout);
    return shouldTimeout
      ? `ERROR: Expected timeout but activity completed: ${result}`
      : `SUCCESS: Activity completed as expected: ${result}`;
  } catch (error) {
    if (shouldTimeout && hasFailureName(error, 'TimeoutFailure')) {
      return `SUCCESS: Activity timed out as expected after ${Date.now() - startedAt}ms`;
    }

    return `ERROR: Activity failed unexpectedly: ${errorMessage(error)}`;
  }
}
