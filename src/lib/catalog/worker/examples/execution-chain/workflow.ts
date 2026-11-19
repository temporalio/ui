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
const TIMER_MULTIPLIERS = [1, 12, 3, 30, 1, 6, 20];

const { flakyStep, brokenStep, busyStep } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: { initialInterval: '1 second', backoffCoefficient: 1 },
});

const proceedSignal = defineSignal('proceed');

const isRunList = (runs: unknown): runs is number[] =>
  Array.isArray(runs) &&
  runs.every((run) => Number.isInteger(run) && run >= 1 && run <= MAX_RUNS);

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function executionChainChild(run: number): Promise<string> {
  await sleep('1 second');
  return `Run ${run} child completed`;
}

export async function executionChain(
  runCount = 14,
  delaySeconds = 1,
  failOnRuns: number[] = [],
  busyRuns: number[] = [],
  completedRuns = 0,
): Promise<string> {
  if (!Number.isInteger(runCount) || runCount < 1 || runCount > MAX_RUNS) {
    throw ApplicationFailure.nonRetryable(
      `Run count must be an integer between 1 and ${MAX_RUNS}.`,
    );
  }
  if (
    !Number.isInteger(delaySeconds) ||
    delaySeconds < 1 ||
    delaySeconds > 30
  ) {
    throw ApplicationFailure.nonRetryable(
      'Delay must be an integer between 1 and 30 seconds.',
    );
  }
  if (!isRunList(failOnRuns) || !isRunList(busyRuns)) {
    throw ApplicationFailure.nonRetryable(
      `Run numbers must be integers between 1 and ${MAX_RUNS}.`,
    );
  }
  if (
    !Number.isInteger(completedRuns) ||
    completedRuns < 0 ||
    completedRuns >= runCount
  ) {
    throw ApplicationFailure.nonRetryable(
      'Completed run count must be a non-negative integer below the run count.',
    );
  }

  const run = completedRuns + 1;
  let proceeded = false;
  setHandler(proceedSignal, () => {
    proceeded = true;
  });

  log.info('Execution chain run', { run, runCount });

  await flakyStep(run);

  try {
    await brokenStep(run);
  } catch (error) {
    log.info('Broken step failed as expected', { error: errorMessage(error) });
  }

  if (busyRuns.includes(run)) {
    await Promise.all(
      Array.from({ length: BUSY_ACTIVITY_COUNT }, (_, index) =>
        busyStep(index + 1),
      ),
    );
  }

  const timerSeconds =
    delaySeconds * TIMER_MULTIPLIERS[(run - 1) % TIMER_MULTIPLIERS.length];
  await sleep(`${timerSeconds} seconds`);
  await executeChild(executionChainChild, { args: [run] });
  await condition(() => proceeded, '2 seconds');

  if (failOnRuns.includes(run) && workflowInfo().attempt === 1) {
    throw ApplicationFailure.retryable(
      `Run ${run} failed on purpose so the workflow Retry Policy starts a new Run.`,
    );
  }

  if (run < runCount) {
    return await continueAsNew<typeof executionChain>(
      runCount,
      delaySeconds,
      failOnRuns,
      busyRuns,
      run,
    );
  }

  return `Completed ${runCount} runs in the execution chain.`;
}
