import {
  ApplicationFailure,
  condition,
  continueAsNew,
  defineSignal,
  executeChild,
  log,
  proxyActivities,
  setHandler,
  sleep,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activity.js';

const MAX_RUNS = 25;
const BUSY_ACTIVITY_COUNT = 300;
const HEAVY_ACTIVITY_COUNT = 8000;
const HEAVY_ACTIVITY_BATCH_SIZE = 1000;
const TIMER_MULTIPLIERS = [1, 12, 3, 30, 1, 6, 20];

const { flakyStep, brokenStep, busyStep } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: { initialInterval: '1 second', backoffCoefficient: 1 },
});

const proceedSignal = defineSignal('proceed');

const isRunIndexList = (runIndexes: unknown): runIndexes is number[] =>
  Array.isArray(runIndexes) &&
  runIndexes.every(
    (runIndex) =>
      Number.isInteger(runIndex) && runIndex >= 0 && runIndex < MAX_RUNS,
  );

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function executionChainChild(runIndex: number): Promise<string> {
  await sleep('1 second');
  return `Run index ${runIndex} child completed`;
}

export interface ExecutionChainOptions {
  totalRuns?: number;
  baseTimerSeconds?: number;
  runIndexesThatFailOnce?: number[];
  runIndexesWith300Activities?: number[];
  runIndexesWith8000Activities?: number[];
}

export async function executionChain(
  options: ExecutionChainOptions = {},
  runIndex = 0,
): Promise<string> {
  const {
    totalRuns = 14,
    baseTimerSeconds = 1,
    runIndexesThatFailOnce = [],
    runIndexesWith300Activities = [],
    runIndexesWith8000Activities = [],
  } = options;

  if (!Number.isInteger(totalRuns) || totalRuns < 1 || totalRuns > MAX_RUNS) {
    throw ApplicationFailure.nonRetryable(
      `totalRuns must be an integer between 1 and ${MAX_RUNS}.`,
    );
  }
  if (
    !Number.isInteger(baseTimerSeconds) ||
    baseTimerSeconds < 1 ||
    baseTimerSeconds > 30
  ) {
    throw ApplicationFailure.nonRetryable(
      'baseTimerSeconds must be an integer between 1 and 30.',
    );
  }
  if (
    !isRunIndexList(runIndexesThatFailOnce) ||
    !isRunIndexList(runIndexesWith300Activities) ||
    !isRunIndexList(runIndexesWith8000Activities)
  ) {
    throw ApplicationFailure.nonRetryable(
      `Run indexes must be integers between 0 and ${MAX_RUNS - 1}.`,
    );
  }
  if (!Number.isInteger(runIndex) || runIndex < 0 || runIndex >= totalRuns) {
    throw ApplicationFailure.nonRetryable(
      'Run index must be a non-negative integer below totalRuns.',
    );
  }

  let proceeded = false;
  setHandler(proceedSignal, () => {
    proceeded = true;
  });

  log.info('Execution chain run', { runIndex, totalRuns });

  await flakyStep(runIndex);

  try {
    await brokenStep(runIndex);
  } catch (error) {
    log.info('Broken step failed as expected', { error: errorMessage(error) });
  }

  if (runIndexesWith300Activities.includes(runIndex)) {
    await Promise.all(
      Array.from({ length: BUSY_ACTIVITY_COUNT }, (_, index) =>
        busyStep(index + 1),
      ),
    );
  }

  if (runIndexesWith8000Activities.includes(runIndex)) {
    for (
      let batchStart = 0;
      batchStart < HEAVY_ACTIVITY_COUNT;
      batchStart += HEAVY_ACTIVITY_BATCH_SIZE
    ) {
      await Promise.all(
        Array.from({ length: HEAVY_ACTIVITY_BATCH_SIZE }, (_, index) =>
          busyStep(batchStart + index + 1),
        ),
      );
    }
  }

  const timerSeconds =
    baseTimerSeconds * TIMER_MULTIPLIERS[runIndex % TIMER_MULTIPLIERS.length];
  await sleep(`${timerSeconds} seconds`);
  await executeChild(executionChainChild, { args: [runIndex] });
  await condition(() => proceeded, '2 seconds');

  if (
    runIndexesThatFailOnce.includes(runIndex) &&
    workflowInfo().attempt === 1
  ) {
    throw ApplicationFailure.retryable(
      `Run index ${runIndex} failed on purpose so the workflow Retry Policy starts a new Run.`,
    );
  }

  if (runIndex + 1 < totalRuns) {
    return await continueAsNew<typeof executionChain>(options, runIndex + 1);
  }

  return `Completed ${totalRuns} runs in the execution chain.`;
}
