import { proxyLocalActivities } from '@temporalio/workflow';

import type * as activities from '../shared-activities.js';

const { processData: processLocalData } = proxyLocalActivities<
  typeof activities
>({ startToCloseTimeout: '5 seconds' });

export async function localActivityWorkflow(
  inputData = `local_${Date.now()}`,
): Promise<string> {
  const localData = await processLocalData(inputData, 1000, 1);
  return `LOCAL ACTIVITY SUCCESS: ${localData}`;
}
