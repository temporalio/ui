import { sleep } from '@temporalio/workflow';

import { handleCrashWorker } from '../../crash-workflow.js';

export async function workerCrashWorkflow(
  durationSeconds = 120,
): Promise<string> {
  handleCrashWorker();
  await sleep(durationSeconds * 1000);
  return `SUCCESS: The run lasted ${durationSeconds} seconds, across any Worker crashes.`;
}
