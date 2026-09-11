import { describe, expect, it } from 'vitest';

import type {
  DescribeWorkerDeployment,
  VersionSummary,
} from '$lib/types/deployments';

import {
  deploymentShowsConnectionStatus,
  deriveConnectionStatus,
  formatConnectionCheckTime,
  resolveValidationOutcome,
  versionShowsConnectionStatus,
} from './connection-status';

const computeVersion = (
  buildId: string,
  status: string,
  scalingGroups: Record<string, unknown> = {
    default: { providerType: 'aws-lambda' },
  },
): VersionSummary =>
  ({
    version: `deployment.${buildId}`,
    createTime: '',
    deploymentVersion: { deploymentName: 'deployment', buildId },
    status,
    computeConfig: { scalingGroups },
  }) as VersionSummary;

const selfHostedVersion = (buildId: string, status: string): VersionSummary =>
  ({
    version: `deployment.${buildId}`,
    createTime: '',
    deploymentVersion: { deploymentName: 'deployment', buildId },
    status,
  }) as VersionSummary;

const describeDeployment = (
  versionSummaries: VersionSummary[],
  currentBuildId?: string,
): DescribeWorkerDeployment =>
  ({
    name: 'deployment',
    createTime: '',
    lastModifierIdentity: 'test',
    routingConfig: currentBuildId
      ? {
          currentDeploymentVersion: {
            deploymentName: 'deployment',
            buildId: currentBuildId,
          },
        }
      : {},
    versionSummaries,
  }) as DescribeWorkerDeployment;

describe('versionShowsConnectionStatus', () => {
  it('shows the status for the current compute-backed version', () => {
    expect(
      versionShowsConnectionStatus(
        computeVersion('build-id', 'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT'),
        {
          currentDeploymentVersion: {
            deploymentName: 'deployment',
            buildId: 'build-id',
          },
        },
      ),
    ).toBe(true);
  });

  it('shows the status for the ramping compute-backed version', () => {
    expect(
      versionShowsConnectionStatus(
        computeVersion('build-id', 'WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING'),
        {
          rampingDeploymentVersion: {
            deploymentName: 'deployment',
            buildId: 'build-id',
          },
        },
      ),
    ).toBe(true);
  });

  it('shows the status for a draining compute-backed version', () => {
    expect(
      versionShowsConnectionStatus(
        computeVersion('build-id', 'WORKER_DEPLOYMENT_VERSION_STATUS_DRAINING'),
        {},
      ),
    ).toBe(true);
  });

  it('hides the status for an inactive version no longer routed to', () => {
    expect(
      versionShowsConnectionStatus(
        computeVersion('build-id', 'WORKER_DEPLOYMENT_VERSION_STATUS_INACTIVE'),
        {},
      ),
    ).toBe(false);
  });

  it('hides the status for a self-hosted current version', () => {
    expect(
      versionShowsConnectionStatus(
        selfHostedVersion(
          'build-id',
          'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
        ),
        {
          currentDeploymentVersion: {
            deploymentName: 'deployment',
            buildId: 'build-id',
          },
        },
      ),
    ).toBe(false);
  });

  it('hides the status when the scaling group names no provider', () => {
    expect(
      versionShowsConnectionStatus(
        computeVersion('build-id', 'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT', {
          default: {},
        }),
        {
          currentDeploymentVersion: {
            deploymentName: 'deployment',
            buildId: 'build-id',
          },
        },
      ),
    ).toBe(false);
  });

  it('reads a provider from the nested provider field', () => {
    expect(
      versionShowsConnectionStatus(
        computeVersion(
          'build-id',
          'WORKER_DEPLOYMENT_VERSION_STATUS_DRAINING',
          { default: { provider: { type: 'gcp-cloud-run' } } },
        ),
        {},
      ),
    ).toBe(true);
  });

  it('hides the status for a legacy version summary', () => {
    expect(
      versionShowsConnectionStatus(
        {
          version: 'deployment.build-id',
          createTime: '',
        } as VersionSummary,
        {},
      ),
    ).toBe(false);
  });
});

describe('deploymentShowsConnectionStatus', () => {
  it('returns false for an undefined deployment', () => {
    expect(deploymentShowsConnectionStatus(undefined)).toBe(false);
  });

  it('returns false when every version is self-hosted', () => {
    expect(
      deploymentShowsConnectionStatus(
        describeDeployment(
          [
            selfHostedVersion(
              'build-id',
              'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
            ),
            selfHostedVersion(
              'build-id-2',
              'WORKER_DEPLOYMENT_VERSION_STATUS_INACTIVE',
            ),
          ],
          'build-id',
        ),
      ),
    ).toBe(false);
  });

  it('returns true when the current version is compute-backed', () => {
    expect(
      deploymentShowsConnectionStatus(
        describeDeployment(
          [
            computeVersion(
              'build-id',
              'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
            ),
          ],
          'build-id',
        ),
      ),
    ).toBe(true);
  });

  it('returns true when only a draining version is compute-backed', () => {
    expect(
      deploymentShowsConnectionStatus(
        describeDeployment(
          [
            selfHostedVersion(
              'build-id',
              'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
            ),
            computeVersion(
              'build-id-2',
              'WORKER_DEPLOYMENT_VERSION_STATUS_DRAINING',
            ),
          ],
          'build-id',
        ),
      ),
    ).toBe(true);
  });

  it('returns false when a compute-backed version is not routed to', () => {
    expect(
      deploymentShowsConnectionStatus(
        describeDeployment(
          [
            selfHostedVersion(
              'build-id',
              'WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT',
            ),
            computeVersion(
              'build-id-2',
              'WORKER_DEPLOYMENT_VERSION_STATUS_CREATED',
            ),
          ],
          'build-id',
        ),
      ),
    ).toBe(false);
  });
});

describe('deriveConnectionStatus', () => {
  it('returns pending for undefined computeStatus', () => {
    expect(deriveConnectionStatus(undefined)).toBe('pending');
  });

  it('returns pending when providerValidation has no lastCheckTime', () => {
    expect(deriveConnectionStatus({ providerValidation: {} })).toBe('pending');
  });

  it('returns pending when lastCheckTime absent even with errorMessage', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: { errorMessage: 'some error' },
      }),
    ).toBe('pending');
  });

  it('returns connected when lastCheckTime present and errorMessage undefined', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: { lastCheckTime: { seconds: 1000, nanos: 0 } },
      }),
    ).toBe('connected');
  });

  it('returns connected when lastCheckTime present and errorMessage is empty string', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: {
          lastCheckTime: { seconds: 1000, nanos: 0 },
          errorMessage: '',
        },
      }),
    ).toBe('connected');
  });

  it('returns failed when lastCheckTime present and errorMessage is non-empty', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: {
          lastCheckTime: { seconds: 1000, nanos: 0 },
          errorMessage: 'some error',
        },
      }),
    ).toBe('failed');
  });
});

describe('formatConnectionCheckTime', () => {
  it('returns less than an hour ago for a time 30 minutes ago', () => {
    const time = new Date(Date.now() - 30 * 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('less than an hour ago');
  });

  it('returns 1 hour ago for a time ~1h ago', () => {
    const time = new Date(Date.now() - 65 * 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('1 hour ago');
  });

  it('returns 5 hours ago for a time ~5h ago', () => {
    const time = new Date(Date.now() - 5 * 3600 * 1000 - 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('5 hours ago');
  });

  it('returns 36 hours ago for a time ~36h ago', () => {
    const time = new Date(Date.now() - 36 * 3600 * 1000 - 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('36 hours ago');
  });

  it('returns less than an hour ago for a future time', () => {
    const time = new Date(Date.now() + 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('less than an hour ago');
  });

  it('returns 5 hours ago for a Timestamp 5h ago', () => {
    const ts = {
      seconds: Math.floor((Date.now() - 5 * 3600 * 1000 - 60 * 1000) / 1000),
      nanos: 0,
    };
    expect(formatConnectionCheckTime(ts)).toBe('5 hours ago');
  });

  it('returns less than an hour ago for an invalid date', () => {
    expect(formatConnectionCheckTime(new Date('invalid'))).toBe(
      'less than an hour ago',
    );
  });
});

describe('resolveValidationOutcome', () => {
  const body = (message?: string) =>
    ({ code: 3, message, details: [] }) as never;

  it('treats an InvalidArgument as a verdict and keeps the server message', () => {
    expect(
      resolveValidationOutcome({ status: 400, body: body('Role not assumed') }),
    ).toEqual({ state: 'invalid', message: 'Role not assumed' });
  });

  it('falls back to generic copy for an InvalidArgument with no message', () => {
    expect(resolveValidationOutcome({ status: 400, body: body() })).toEqual({
      state: 'invalid',
      message: 'Failed to validate connection',
    });
  });

  it('does not call a gateway timeout invalid', () => {
    expect(
      resolveValidationOutcome({ status: 504, body: body('Gateway Timeout') }),
    ).toEqual({ state: 'indeterminate', message: 'Gateway Timeout' });
  });

  it.each([500, 502, 503, 504])(
    'reports %i as indeterminate rather than invalid',
    (status) => {
      expect(resolveValidationOutcome({ status, body: body() }).state).toBe(
        'indeterminate',
      );
    },
  );

  it.each([401, 403, 404, 429])(
    'reports %i as indeterminate because it is not a connection verdict',
    (status) => {
      expect(resolveValidationOutcome({ status, body: body() }).state).toBe(
        'indeterminate',
      );
    },
  );

  it('drops an empty message rather than showing a blank line', () => {
    expect(resolveValidationOutcome({ status: 504, body: body('') })).toEqual({
      state: 'indeterminate',
      message: undefined,
    });
  });
});
