import {
  ApplicationFailure,
  condition,
  continueAsNew,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
} from '@temporalio/workflow';

import type * as activities from './activity.js';

const { recordLiveTimelineTick } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: { maximumAttempts: 3 },
});

export const timelineLiveStop = defineSignal('timelineLiveStop');
export const timelineLiveProgress = defineQuery<{
  ticksThisRun: number;
  remainingDurationSeconds: number;
  stopRequested: boolean;
}>('timelineLiveProgress');

export async function timelineLiveWorkflow(
  totalDurationSeconds = 86400,
  intervalSeconds = 5,
  ticksPerRun = 120,
): Promise<string> {
  for (const [name, value, minimum, maximum] of [
    ['totalDurationSeconds', totalDurationSeconds, 1, 604800],
    ['intervalSeconds', intervalSeconds, 2, 60],
    ['ticksPerRun', ticksPerRun, 20, 1000],
  ] satisfies [string, number, number, number][]) {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw ApplicationFailure.nonRetryable(
        `${name} must be an integer between ${minimum} and ${maximum}`,
      );
    }
  }

  let stopRequested = false;
  let ticksThisRun = 0;
  let remainingDurationSeconds = totalDurationSeconds;

  setHandler(timelineLiveStop, () => {
    stopRequested = true;
  });
  setHandler(timelineLiveProgress, () => ({
    ticksThisRun,
    remainingDurationSeconds,
    stopRequested,
  }));

  while (remainingDurationSeconds > 0 && !stopRequested) {
    await recordLiveTimelineTick(++ticksThisRun);
    const waitSeconds = Math.min(intervalSeconds, remainingDurationSeconds);
    if (await condition(() => stopRequested, waitSeconds * 1000)) break;
    remainingDurationSeconds -= waitSeconds;

    if (
      !stopRequested &&
      remainingDurationSeconds > 0 &&
      ticksThisRun >= ticksPerRun
    ) {
      return continueAsNew<typeof timelineLiveWorkflow>(
        remainingDurationSeconds,
        intervalSeconds,
        ticksPerRun,
      );
    }
  }

  return stopRequested
    ? 'Live timeline stopped by signal and completed'
    : 'Live timeline completed its configured duration';
}
