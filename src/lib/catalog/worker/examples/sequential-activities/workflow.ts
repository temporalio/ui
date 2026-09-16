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

export async function sequentialActivities(
  dataId = `seq_data_${Date.now()}`,
): Promise<string> {
  const resultA = await processData(dataId, 1000, 3);
  const resultB = await processData(dataId, 1500, 2);
  const resultC = await processData(dataId, 2000, 1);
  return `Sequential activities completed for ${dataId}: A=${resultA}, B=${resultB}, C=${resultC}`;
}
