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

  // DescribeWorkerDeployment only returns versionSummaries + routingConfig.
  it('returns true when the routed current version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDeployment,
        currentVersionSummary: undefined,
        routingConfig: {
          currentDeploymentVersion: {
            deploymentName: 'loan-underwriting-app',
            buildId: 'build-1',
          },
        },
        versionSummaries: [
          {
            version: 'loan-underwriting-app.build-1',
            deploymentVersion: {
              deploymentName: 'loan-underwriting-app',
              buildId: 'build-1',
            },
            createTime: undefined,
            computeConfig,
          },
        ],
      } as unknown as WorkerDeploymentInfo),
    ).toBe(true);
  });

  it('returns true when the routed ramping version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDeployment,
        currentVersionSummary: undefined,
        routingConfig: {
          rampingDeploymentVersion: {
            deploymentName: 'loan-underwriting-app',
            buildId: 'build-2',
          },
        },
        versionSummaries: [
          {
            version: 'loan-underwriting-app.build-2',
            deploymentVersion: {
              deploymentName: 'loan-underwriting-app',
              buildId: 'build-2',
            },
            createTime: undefined,
            computeConfig,
          },
        ],
      } as unknown as WorkerDeploymentInfo),
    ).toBe(true);
  });

  // Verbatim DescribeWorkerDeployment payload from Temporal Cloud. Note that it
  // carries no currentVersionSummary at all — compute config only ever arrives
  // on versionSummaries, linked by routingConfig.currentDeploymentVersion.
  it('returns true for a real cloud describe response', () => {
    const cloudResponse = {
      name: 'test',
      versionSummaries: [
        {
          version: 'test.62a8974f-86fe-4a77-a308-148beed6a67d',
          status: 'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
          deploymentVersion: {
            buildId: '62a8974f-86fe-4a77-a308-148beed6a67d',
            deploymentName: 'test',
          },
          createTime: '2026-07-08T15:36:00.023495719Z',
          currentSinceTime: '2026-07-08T15:36:01.475175109Z',
          routingUpdateTime: '2026-07-08T15:36:01.475175109Z',
          firstActivationTime: '2026-07-08T15:36:01.475175109Z',
          lastCurrentTime: '2026-07-08T15:36:01.475175109Z',
          computeConfig: {
            scalingGroups: {
              default: {
                taskQueueTypes: [
                  'TASK_QUEUE_TYPE_WORKFLOW',
                  'TASK_QUEUE_TYPE_ACTIVITY',
                ],
                providerType: 'aws-lambda',
              },
            },
          },
          computeStatus: {
            providerValidation: {
              lastCheckTime: '2026-08-04T18:54:10.136859273Z',
            },
          },
        },
      ],
      createTime: '2026-07-08T15:35:58.120242067Z',
      routingConfig: {
        currentDeploymentVersion: {
          buildId: '62a8974f-86fe-4a77-a308-148beed6a67d',
          deploymentName: 'test',
        },
        currentVersion: 'test.62a8974f-86fe-4a77-a308-148beed6a67d',
        currentVersionChangedTime: '2026-07-08T15:36:01.475175109Z',
        revisionNumber: '1',
      },
      routingConfigUpdateState: 'ROUTING_CONFIG_UPDATE_STATE_IN_PROGRESS',
    } as unknown as WorkerDeploymentInfo;

    expect(cloudResponse.currentVersionSummary).toBeUndefined();
    expect(deploymentHasComputeConfig(cloudResponse)).toBe(true);
  });

  it('ignores compute configs on version summaries that are not routed to', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDeployment,
        currentVersionSummary: undefined,
        routingConfig: {
          currentDeploymentVersion: {
            deploymentName: 'loan-underwriting-app',
            buildId: 'build-1',
          },
        },
        versionSummaries: [
          {
            version: 'loan-underwriting-app.build-1',
            deploymentVersion: {
              deploymentName: 'loan-underwriting-app',
              buildId: 'build-1',
            },
            createTime: undefined,
          },
          {
            version: 'loan-underwriting-app.build-0',
            deploymentVersion: {
              deploymentName: 'loan-underwriting-app',
              buildId: 'build-0',
            },
            createTime: undefined,
            computeConfig,
          },
        ],
      } as unknown as WorkerDeploymentInfo),
    ).toBe(false);
  });
});
