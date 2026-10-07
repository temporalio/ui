import type { WorkflowRunWithWorkers } from '$lib/stores/workflow-run';
import type { PollerInfo, TaskQueueResponse } from '$lib/types';

import { validTimeToDate } from './format-time';
import { getWorkerDeploymentName } from './get-worker-deployment-name';

// DescribeTaskQueue keeps a poller listed for several minutes after it last
// polled. A live worker re-polls at least once per long-poll timeout (~1
// minute), so anything older than this has stopped.
export const ACTIVE_POLLER_WINDOW_MS = 2 * 60 * 1000;

const lastAccessMs = (poller: PollerInfo): number | undefined => {
  if (!poller.lastAccessTime) return undefined;
  try {
    return validTimeToDate(poller.lastAccessTime).getTime();
  } catch {
    return undefined;
  }
};

// A poller without a readable access time counts as active: reporting "no
// workers" when one may be running is the worse mistake.
export const isActivePoller = (
  poller: PollerInfo,
  now: number = Date.now(),
): boolean => {
  const accessed = lastAccessMs(poller);
  return accessed === undefined || now - accessed <= ACTIVE_POLLER_WINDOW_MS;
};

export const countActivePollers = (
  workers: TaskQueueResponse | undefined,
  now: number = Date.now(),
): number =>
  workers?.pollers?.filter((poller) => isActivePoller(poller, now)).length ?? 0;

export const hasActivePollers = (
  workers: TaskQueueResponse | undefined,
  now: number = Date.now(),
): boolean => countActivePollers(workers, now) > 0;

/**
 * - `not-waiting`: nothing is waiting on a worker, or pollers have not loaded.
 * - `polling`: an active worker is polling the task queue.
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
  now?: number;
};

export const getWorkerAvailability = ({
  waiting,
  workers,
  deployment,
  serverless,
  now = Date.now(),
}: WorkerAvailabilityInput): WorkerAvailability => {
  if (!waiting || !workers) return { state: 'not-waiting' };
  if (hasActivePollers(workers, now)) return { state: 'polling' };
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
  const { waiting, workers } = workflowRunAvailabilityInput(workflowRun);
  return waiting && Boolean(workers) && !hasActivePollers(workers);
};

export const needsServerlessCheck = (
  input: Omit<WorkerAvailabilityInput, 'serverless'>,
): boolean =>
  getWorkerAvailability({ ...input, serverless: undefined }).state ===
  'checking-deployment';
