import { proxyActivities } from '@temporalio/workflow';

import type * as activities from '../shared-activities.js';

const { processData } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});

export async function highEventCountWorkflow(
  count = 7,
  activityDelay = 2000,
): Promise<string> {
  const results = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      processData(`async-${index}`, activityDelay, 1),
    ),
  );
  return `HIGH EVENT COUNT: ${results.length} concurrent activities completed`;
}
