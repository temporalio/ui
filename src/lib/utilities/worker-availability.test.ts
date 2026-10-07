import { describe, expect, it } from 'vitest';

import type { WorkflowRunWithWorkers } from '$lib/stores/workflow-run';
import type { PollerInfo, TaskQueueResponse } from '$lib/types';
import type { WorkflowExecution } from '$lib/types/workflows';

import {
  ACTIVE_POLLER_WINDOW_MS,
  countActivePollers,
  getWorkerAvailability,
  hasActivePollers,
  isActivePoller,
  isRunningWithNoWorkers,
  needsServerlessCheck,
  workflowRunAvailabilityInput,
} from './worker-availability';

const NOW = Date.parse('2026-10-07T12:00:00Z');

const poller = (msAgo?: number): PollerInfo => ({
  identity: `worker-${msAgo}`,
  lastAccessTime:
    msAgo === undefined ? undefined : new Date(NOW - msAgo).toISOString(),
});

const queue = (...pollers: PollerInfo[]): TaskQueueResponse => ({
  pollers,
});

const fresh = queue(poller(5_000));
const stale = queue(poller(ACTIVE_POLLER_WINDOW_MS + 1));
const empty = queue();

describe('isActivePoller', () => {
  it('counts a poller seen inside the window', () => {
    expect(isActivePoller(poller(ACTIVE_POLLER_WINDOW_MS), NOW)).toBe(true);
  });

  it('drops a poller last seen outside the window', () => {
    expect(isActivePoller(poller(ACTIVE_POLLER_WINDOW_MS + 1), NOW)).toBe(
      false,
    );
  });

  it('counts a poller with no access time', () => {
    expect(isActivePoller(poller(), NOW)).toBe(true);
  });

  it('counts a poller with an unreadable access time', () => {
    expect(isActivePoller({ lastAccessTime: 'not a time' }, NOW)).toBe(true);
  });
});

describe('countActivePollers / hasActivePollers', () => {
  it('ignores stale pollers', () => {
    const workers = queue(poller(1_000), poller(ACTIVE_POLLER_WINDOW_MS * 2));
    expect(countActivePollers(workers, NOW)).toBe(1);
    expect(hasActivePollers(stale, NOW)).toBe(false);
  });

  it('treats missing workers as none', () => {
    expect(countActivePollers(undefined, NOW)).toBe(0);
    expect(hasActivePollers({}, NOW)).toBe(false);
  });
});

describe('getWorkerAvailability', () => {
  const base = {
    waiting: true,
    workers: empty,
    deployment: undefined,
    serverless: undefined,
    now: NOW,
  };

  it('is not-waiting when nothing needs a worker', () => {
    expect(getWorkerAvailability({ ...base, waiting: false }).state).toBe(
      'not-waiting',
    );
  });

  it('is not-waiting until pollers load', () => {
    expect(getWorkerAvailability({ ...base, workers: undefined }).state).toBe(
      'not-waiting',
    );
  });

  it('is polling when an active worker is present, even for serverless', () => {
    expect(
      getWorkerAvailability({
        ...base,
        workers: fresh,
        deployment: 'orders',
        serverless: true,
      }).state,
    ).toBe('polling');
  });

  it('is no-workers when no deployment serves the queue', () => {
    expect(getWorkerAvailability(base).state).toBe('no-workers');
  });

  it('is no-workers when only stale pollers remain', () => {
    expect(getWorkerAvailability({ ...base, workers: stale }).state).toBe(
      'no-workers',
    );
  });

  it('holds at checking-deployment until the compute config resolves', () => {
    expect(getWorkerAvailability({ ...base, deployment: 'orders' })).toEqual({
      state: 'checking-deployment',
      deployment: 'orders',
    });
  });

  it('is serverless-idle for a deployment with compute config', () => {
    expect(
      getWorkerAvailability({
        ...base,
        deployment: 'orders',
        serverless: true,
      }),
    ).toEqual({ state: 'serverless-idle', deployment: 'orders' });
  });

  it('is no-workers for a self-managed deployment', () => {
    expect(
      getWorkerAvailability({
        ...base,
        deployment: 'orders',
        serverless: false,
      }).state,
    ).toBe('no-workers');
  });
});

describe('needsServerlessCheck', () => {
  const base = { waiting: true, workers: empty, deployment: 'orders' };

  it('checks only an empty queue with a deployment', () => {
    expect(needsServerlessCheck({ ...base, now: NOW })).toBe(true);
    expect(needsServerlessCheck({ ...base, workers: fresh, now: NOW })).toBe(
      false,
    );
    expect(
      needsServerlessCheck({ ...base, deployment: undefined, now: NOW }),
    ).toBe(false);
    expect(needsServerlessCheck({ ...base, waiting: false, now: NOW })).toBe(
      false,
    );
  });
});

describe('workflowRunAvailabilityInput', () => {
  const run = (
    workflow: Partial<WorkflowExecution>,
    workers: TaskQueueResponse,
    workersLoaded = true,
  ): WorkflowRunWithWorkers =>
    ({ workflow, workers, workersLoaded }) as WorkflowRunWithWorkers;

  it('waits for running and paused workflows', () => {
    expect(
      workflowRunAvailabilityInput(run({ isRunning: true }, empty)).waiting,
    ).toBe(true);
    expect(
      workflowRunAvailabilityInput(run({ isPaused: true }, empty)).waiting,
    ).toBe(true);
    expect(workflowRunAvailabilityInput(run({}, empty)).waiting).toBe(false);
  });

  it('withholds workers until loaded', () => {
    expect(
      workflowRunAvailabilityInput(run({ isRunning: true }, empty, false))
        .workers,
    ).toBeUndefined();
  });

  it('resolves the deployment from the task queue', () => {
    const workers: TaskQueueResponse = {
      pollers: [],
      versioningInfo: {
        currentDeploymentVersion: { deploymentName: 'orders', buildId: 'v1' },
      },
    };
    expect(
      workflowRunAvailabilityInput(run({ isRunning: true }, workers))
        .deployment,
    ).toBe('orders');
  });
});

describe('isRunningWithNoWorkers', () => {
  const run = (workers: TaskQueueResponse, workersLoaded = true) =>
    ({
      workflow: { isRunning: true },
      workers,
      workersLoaded,
    }) as WorkflowRunWithWorkers;

  it('is true for an empty, loaded queue', () => {
    expect(isRunningWithNoWorkers(run(empty))).toBe(true);
  });

  it('is false before pollers load', () => {
    expect(isRunningWithNoWorkers(run(empty, false))).toBe(false);
  });

  it('is false with a live poller', () => {
    const live = { lastAccessTime: new Date().toISOString() };
    expect(isRunningWithNoWorkers(run(queue(live)))).toBe(false);
  });
});
