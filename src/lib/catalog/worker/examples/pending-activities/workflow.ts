import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activity.js';

// No Worker polls this queue, so activities scheduled on it are never started.
const UNPOLLED_TASK_QUEUE = 'catalog-pending-activities-unpolled';

function retryingActivityFor(index: number): Promise<string> {
  return proxyActivities<typeof activities>({
    startToCloseTimeout: '10 seconds',
    retry: {
      initialInterval: '1 second',
      backoffCoefficient: 2,
      maximumInterval: '1 minute',
    },
    summary: `Retrying activity ${index}`,
  }).retryingActivity(index);
}

function unpolledActivityFor(index: number): Promise<string> {
  return proxyActivities<typeof activities>({
    taskQueue: UNPOLLED_TASK_QUEUE,
    startToCloseTimeout: '10 seconds',
    summary: `Unpolled activity ${index}`,
  }).unpolledActivity(index);
}

export async function pendingActivitiesWorkflow(
  retryingCount = 2,
  unpolledCount = 2,
): Promise<string> {
  const retrying = Array.from({ length: retryingCount }, (_, i) =>
    retryingActivityFor(i + 1),
  );
  const unpolled = Array.from({ length: unpolledCount }, (_, i) =>
    unpolledActivityFor(i + 1),
  );
  const results = await Promise.all([...retrying, ...unpolled]);
  return results.join('\n');
}
