import { continueAsNew, sleep } from '@temporalio/workflow';

export async function continueAsNewWorkflow(
  totalRuns = 3,
  currentRun = 1,
): Promise<string> {
  await sleep('1 second');

  if (currentRun < totalRuns) {
    return continueAsNew<typeof continueAsNewWorkflow>(
      totalRuns,
      currentRun + 1,
    );
  }

  return `Completed ${totalRuns} runs with continue-as-new`;
}
