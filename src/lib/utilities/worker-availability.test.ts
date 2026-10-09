import { describe, expect, it } from 'vitest';

import type { WorkflowRunWithWorkers } from '$lib/stores/workflow-run';
import type { TaskQueueResponse } from '$lib/types';
import type { WorkflowExecution } from '$lib/types/workflows';

import {
  countPollers,
  getWorkerAvailability,
  hasPollers,
  needsServerlessCheck,
  workflowRunAvailabilityInput,
} from './worker-availability';

const polling: TaskQueueResponse = {
  pollers: [{ identity: 'worker', lastAccessTime: '2020-01-01T00:00:00Z' }],
};
const empty: TaskQueueResponse = { pollers: [] };
const deployed: TaskQueueResponse = {
  pollers: [],
  versioningInfo: {
    currentDeploymentVersion: { deploymentName: 'orders', buildId: 'v1' },
  },
};

describe('countPollers / hasPollers', () => {
  it('counts every poller the server lists, however long since it polled', () => {
    expect(countPollers(polling)).toBe(1);
    expect(hasPollers(polling)).toBe(true);
  });

  it('treats an empty or missing list as none', () => {
    expect(countPollers(empty)).toBe(0);
    expect(countPollers(undefined)).toBe(0);
    expect(hasPollers({})).toBe(false);
  });
});

describe('getWorkerAvailability', () => {
  const base = {
    waiting: true,
    workers: empty,
    deployment: undefined,
    serverless: undefined,
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

  it('is polling when the server lists a poller, even for serverless', () => {
    expect(
      getWorkerAvailability({
        ...base,
        workers: polling,
        deployment: 'orders',
        serverless: true,
      }).state,
    ).toBe('polling');
  });

  it('is no-workers when no deployment serves the queue', () => {
    expect(getWorkerAvailability(base).state).toBe('no-workers');
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
    expect(needsServerlessCheck(base)).toBe(true);
    expect(needsServerlessCheck({ ...base, workers: polling })).toBe(false);
    expect(needsServerlessCheck({ ...base, deployment: undefined })).toBe(
      false,
    );
    expect(needsServerlessCheck({ ...base, waiting: false })).toBe(false);
  });
});

const run = (
  workflow: Partial<WorkflowExecution>,
  workers: TaskQueueResponse,
  workersLoaded = true,
): WorkflowRunWithWorkers =>
  ({ workflow, workers, workersLoaded }) as WorkflowRunWithWorkers;

describe('workflowRunAvailabilityInput', () => {
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
    expect(
      workflowRunAvailabilityInput(run({ isRunning: true }, deployed))
        .deployment,
    ).toBe('orders');
  });
});
