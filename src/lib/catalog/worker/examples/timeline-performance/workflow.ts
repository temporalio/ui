import { sleep } from '@temporalio/workflow';

/** Generates a bounded, paged history of timer and workflow-task events. */
export async function timelinePerformanceWorkflow(
  timerCount = 200,
): Promise<string> {
  if (!Number.isInteger(timerCount) || timerCount < 1 || timerCount > 7000) {
    throw new Error('Timer count must be between 1 and 7000');
  }

  const batchSize = 200;

  for (let remaining = timerCount; remaining > 0; remaining -= batchSize) {
    await Promise.all(
      Array.from({ length: Math.min(remaining, batchSize) }, () => sleep(1)),
    );
  }

  return `Completed ${timerCount} timers`;
}
