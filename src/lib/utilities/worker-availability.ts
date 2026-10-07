import type { WorkflowRunWithWorkers } from '$lib/stores/workflow-run';
import type { TaskQueueResponse } from '$lib/types';

import { getWorkerDeploymentName } from './get-worker-deployment-name';

// DescribeTaskQueue lists a poller until it has been silent for the server's
// matching.PollerHistoryTTL (5 minutes by default). Deferring to that list
// keeps a worker whose task slots are all busy, and so has paused polling,
// from being reported as gone.
export const countPollers = (workers: TaskQueueResponse | undefined): number =>
  workers?.pollers?.length ?? 0;

export const hasPollers = (workers: TaskQueueResponse | undefined): boolean =>
  countPollers(workers) > 0;

/**
 * - `not-waiting`: nothing is waiting on a worker, or pollers have not loaded.
 * - `polling`: the server lists at least one poller on the task queue.
 * - `checking-deployment`: no pollers, and the deployment's compute config is
 *   still being fetched. Render nothing so the wrong message never flashes.
 * - `serverless-idle`: Temporal invokes the workers for this deployment and it
 *   has scaled to zero. Expected; workers start when there is work.
 * - `no-workers`: self-managed workers are not polling. Needs user action.
 */
export type WorkerAvailability =
  | { state: 'not-waiting' }
  | { state: 'polling' }
  | { state: 'checking-deployment'; deployment: string }
  | { state: 'serverless-idle'; deployment: string }
  | { state: 'no-workers' };

export type WorkerAvailabilityInput = {
  waiting: boolean;
  workers: TaskQueueResponse | undefined;
  deployment: string | undefined;
  serverless: boolean | undefined;
};

export const getWorkerAvailability = ({
  waiting,
  workers,
  deployment,
  serverless,
}: WorkerAvailabilityInput): WorkerAvailability => {
  if (!waiting || !workers) return { state: 'not-waiting' };
  if (hasPollers(workers)) return { state: 'polling' };
  if (!deployment) return { state: 'no-workers' };
  if (serverless === undefined) {
    return { state: 'checking-deployment', deployment };
  }
  if (serverless) return { state: 'serverless-idle', deployment };
  return { state: 'no-workers' };
};

export const workflowRunAvailabilityInput = ({
  workflow,
  workers,
  workersLoaded,
}: WorkflowRunWithWorkers): Omit<WorkerAvailabilityInput, 'serverless'> => ({
  waiting: Boolean(workflow?.isRunning || workflow?.isPaused),
  workers: workersLoaded ? workers : undefined,
  deployment: getWorkerDeploymentName(workers, workflow),
});

export const isRunningWithNoWorkers = (
  workflowRun: WorkflowRunWithWorkers,
): boolean => {
  const { state } = getWorkerAvailability({
    ...workflowRunAvailabilityInput(workflowRun),
    serverless: undefined,
  });
  return state === 'no-workers' || state === 'checking-deployment';
};

export const needsServerlessCheck = (
  input: Omit<WorkerAvailabilityInput, 'serverless'>,
): boolean =>
  getWorkerAvailability({ ...input, serverless: undefined }).state ===
  'checking-deployment';
