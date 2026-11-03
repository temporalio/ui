import { continueAsNew, log, sleep } from '@temporalio/workflow';

export async function continueAsNewChain(
  runCount = 5,
  delaySeconds = 2,
  completedRuns = 0,
): Promise<string> {
  if (!Number.isInteger(runCount) || runCount < 1 || runCount > 25) {
    throw new Error('Run count must be an integer between 1 and 25.');
  }
  if (
    !Number.isInteger(delaySeconds) ||
    delaySeconds < 1 ||
    delaySeconds > 30
  ) {
    throw new Error('Delay must be an integer between 1 and 30 seconds.');
  }
  if (
    !Number.isInteger(completedRuns) ||
    completedRuns < 0 ||
    completedRuns >= runCount
  ) {
    throw new Error(
      'Completed run count must be a non-negative integer below the run count.',
    );
  }

  const currentRun = completedRuns + 1;
  log.info('Continue-As-New chain run', { currentRun, runCount });
  await sleep(`${delaySeconds} seconds`);

  if (currentRun < runCount) {
    return await continueAsNew<typeof continueAsNewChain>(
      runCount,
      delaySeconds,
      currentRun,
    );
  }

  return `Completed ${runCount} runs in the Continue-As-New chain.`;
}
