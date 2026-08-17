import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activity.js';

const { retryActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: {
    maximumAttempts: 5,
    initialInterval: '1 second',
    maximumInterval: '5 seconds',
    backoffCoefficient: 2,
  },
});

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function retryWorkflow(
  failuresBeforeSuccess = 2,
): Promise<string> {
  try {
    return `SUCCESS: ${await retryActivity(failuresBeforeSuccess)}`;
  } catch (error) {
    return `FAILURE: Activity exhausted retries: ${errorMessage(error)}`;
  }
}
