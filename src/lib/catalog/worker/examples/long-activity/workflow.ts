import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activity.js';

const { processLongData } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});

export async function longActivity(delay = 5000): Promise<string> {
  return processLongData(delay);
}
