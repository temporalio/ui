import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activity.js';

const { heartbeatActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function heartbeatWorkflow(
  steps = 5,
  stepDelay = 1000,
): Promise<string> {
  try {
    return `SUCCESS: ${await heartbeatActivity(steps, stepDelay)}`;
  } catch (error) {
    return `FAILURE: Heartbeat workflow failed: ${errorMessage(error)}`;
  }
}
