import { describe, expect, it } from 'vitest';

import type {
  ComputeConfig,
  WorkerDeploymentInfo,
} from '$lib/types/deployments';

import { deploymentHasComputeConfig } from './deployment-has-compute-config';

const computeConfig: ComputeConfig = {
  scalingGroups: {
    default: {
      taskQueueTypes: ['TASK_QUEUE_TYPE_WORKFLOW', 'TASK_QUEUE_TYPE_ACTIVITY'],
      provider: { type: 'aws-lambda' },
    },
  },
};

const baseDeployment = {
  name: 'loan-underwriting-app',
  createTime: undefined,
  routingConfig: {},
  lastModifierIdentity: 'test',
  versionSummaries: [],
  currentVersionSummary: {
    version: 'loan-underwriting-app.build-1',
    createTime: undefined,
  },
} as unknown as WorkerDeploymentInfo;

describe('deploymentHasComputeConfig', () => {
  it('returns false for undefined deployment', () => {
    expect(deploymentHasComputeConfig(undefined)).toBe(false);
  });

  it('returns false when no compute config exists', () => {
    expect(deploymentHasComputeConfig(baseDeployment)).toBe(false);
  });

  it('returns false when compute config has no scaling groups', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDeployment,
        computeConfig: { scalingGroups: {} },
      }),
    ).toBe(false);
  });

  it('returns true when the deployment has a compute config', () => {
    expect(
      deploymentHasComputeConfig({ ...baseDeployment, computeConfig }),
    ).toBe(true);
  });

  it('returns true when the current version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDeployment,
        currentVersionSummary: {
          ...baseDeployment.currentVersionSummary,
          computeConfig,
        },
      }),
    ).toBe(true);
  });

  it('returns true when the ramping version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDeployment,
        rampingVersionSummary: {
          version: 'loan-underwriting-app.build-2',
          createTime: undefined,
          computeConfig,
        },
      }),
    ).toBe(true);
  });

  it('ignores compute configs on inactive versions', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDeployment,
        latestVersionSummary: {
          version: 'loan-underwriting-app.build-2',
          createTime: undefined,
          computeConfig,
        },
        versionSummaries: [
          {
            version: 'loan-underwriting-app.build-0',
            createTime: undefined,
            computeConfig,
          },
        ],
      }),
    ).toBe(false);
  });
});
