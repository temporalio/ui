import { describe, expect, it } from 'vitest';

import type {
  ComputeConfig,
  DescribeWorkerDeployment,
  ListWorkerDeployment,
} from '$lib/types/deployments';

import { deploymentHasComputeConfig } from './deployment-has-compute-config';

const computeConfig: ComputeConfig = {
  scalingGroups: {
    default: {
      provider: { type: 'aws-lambda' },
    },
  },
};

const baseDescribe = {
  name: 'loan-underwriting-app',
  createTime: '',
  routingConfig: {},
  versionSummaries: [],
} satisfies DescribeWorkerDeployment;

const baseList = {
  name: 'loan-underwriting-app',
  createTime: '',
  routingConfig: {},
  currentVersionSummary: {
    version: 'loan-underwriting-app.build-1',
    createTime: '',
  },
} satisfies ListWorkerDeployment;

describe('deploymentHasComputeConfig', () => {
  it('returns false for undefined deployment', () => {
    expect(deploymentHasComputeConfig(undefined)).toBe(false);
  });

  it('returns false when no compute config exists', () => {
    expect(deploymentHasComputeConfig(baseDescribe)).toBe(false);
  });

  it('returns false when a list response has no version summaries', () => {
    expect(
      deploymentHasComputeConfig({
        name: 'loan-underwriting-app',
        createTime: '',
        routingConfig: {},
      }),
    ).toBe(false);
  });

  it('returns true when a list current version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseList,
        currentVersionSummary: {
          ...baseList.currentVersionSummary,
          computeConfig,
        },
      }),
    ).toBe(true);
  });

  it('returns true when a list ramping version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseList,
        rampingVersionSummary: {
          version: 'loan-underwriting-app.build-2',
          createTime: '',
          computeConfig,
        },
      }),
    ).toBe(true);
  });

  it('ignores compute configs on describe versions that are not routed to', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDescribe,
        versionSummaries: [
          {
            version: 'loan-underwriting-app.build-0',
            createTime: '',
            computeConfig,
          },
        ],
      }),
    ).toBe(false);
  });

  it('returns true when the routed current version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDescribe,
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
            createTime: '',
            computeConfig,
          },
        ],
      }),
    ).toBe(true);
  });

  it('returns true when the routed ramping version summary has a compute config', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDescribe,
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
            createTime: '',
            computeConfig,
          },
        ],
      }),
    ).toBe(true);
  });

  // Verbatim DescribeWorkerDeployment payload from Temporal Cloud. Compute
  // config is only exposed on versionSummaries and linked by routingConfig.
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
    } satisfies DescribeWorkerDeployment;

    expect(deploymentHasComputeConfig(cloudResponse)).toBe(true);
  });

  it('ignores compute configs on describe versions that are not routed to', () => {
    expect(
      deploymentHasComputeConfig({
        ...baseDescribe,
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
            createTime: '',
          },
          {
            version: 'loan-underwriting-app.build-0',
            deploymentVersion: {
              deploymentName: 'loan-underwriting-app',
              buildId: 'build-0',
            },
            createTime: '',
            computeConfig,
          },
        ],
      }),
    ).toBe(false);
  });
});
