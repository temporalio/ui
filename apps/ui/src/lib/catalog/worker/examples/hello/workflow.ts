import { proxyActivities } from '@temporalio/workflow';

import type * as activities from '../shared-activities.js';

const { greet } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});

export async function hello(name = 'Temporal'): Promise<string> {
  return greet(name);
}
