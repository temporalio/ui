import { proxyActivities, sleep } from '@temporalio/workflow';

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

export async function scheduleWorkflow(
  intervalSeconds = 10,
  maxRuns = 3,
): Promise<string> {
  const runs: string[] = [];
  for (let run = 1; run <= maxRuns; run += 1) {
    const runStart = Date.now();
    const result = await processData(`timer-run-${run}`, 1000, 2);
    runs.push(`Run ${run} (${new Date(runStart).toISOString()}): ${result}`);
    if (run < maxRuns) await sleep(`${intervalSeconds} seconds`);
  }
  return `TIMER LOOP COMPLETED: Executed ${maxRuns} runs at ${intervalSeconds}s intervals:\n${runs.join('\n')}`;
}
