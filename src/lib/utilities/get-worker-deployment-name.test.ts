import { describe, expect, it } from 'vitest';

import type { TaskQueueResponse } from '$lib/types';
import type { WorkflowExecution } from '$lib/types/workflows';

import { getWorkerDeploymentName } from './get-worker-deployment-name';

const workers = (versioningInfo: unknown): TaskQueueResponse =>
  ({ pollers: [], versioningInfo }) as TaskQueueResponse;

const workflow = (deployment?: string): WorkflowExecution =>
  ({
    searchAttributes: {
      indexedFields: deployment ? { TemporalWorkerDeployment: deployment } : {},
    },
  }) as unknown as WorkflowExecution;

describe('getWorkerDeploymentName', () => {
  it('reads the deployment from the task queue when there are no pollers', () => {
    const result = getWorkerDeploymentName(
      workers({
        currentDeploymentVersion: {
          deploymentName: 'orders-worker',
          buildId: 'v1',
        },
      }),
      workflow(),
    );

    expect(result).toBe('orders-worker');
  });

  it('returns undefined for an unversioned task queue that still has versioningInfo', () => {
    const result = getWorkerDeploymentName(
      workers({
        currentVersion: '__unversioned__',
        updateTime: '0001-01-01T00:00:00Z',
      }),
      workflow(),
    );

    expect(result).toBeUndefined();
  });

  it('falls back to the search attribute when the queue has no current version', () => {
    const result = getWorkerDeploymentName(
      workers({ currentVersion: '__unversioned__' }),
      workflow('pinned-deployment'),
    );

    expect(result).toBe('pinned-deployment');
  });

  it('prefers the task queue over the search attribute', () => {
    const result = getWorkerDeploymentName(
      workers({
        currentDeploymentVersion: { deploymentName: 'current', buildId: 'v2' },
      }),
      workflow('stale-from-search-attribute'),
    );

    expect(result).toBe('current');
  });

  it('returns undefined when neither source has a deployment', () => {
    expect(
      getWorkerDeploymentName(workers(undefined), workflow()),
    ).toBeUndefined();
    expect(getWorkerDeploymentName(undefined, null)).toBeUndefined();
  });
});
