import { describe, expect, it } from 'vitest';

import {
  createDeploymentSchema,
  editVersionSchema,
  getInitialComputeProvider,
} from './shared';

describe('getInitialComputeProvider', () => {
  it('defaults to Lambda when provider configuration is omitted', () => {
    expect(getInitialComputeProvider()).toBe('lambda');
  });

  it('uses the first visible enabled configured provider', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('cloud-run');
  });

  it('ignores hidden providers', () => {
    expect(
      getInitialComputeProvider({
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('falls back to Lambda when no configured provider is selectable', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run', hidden: true },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing visible provider when it is disabled', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing provider when provider configuration is omitted', () => {
    expect(getInitialComputeProvider({ provider: 'cloud-run' })).toBe(
      'cloud-run',
    );
  });

  it('uses the first visible enabled provider when the existing provider is hidden', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('uses the first visible enabled provider when the existing provider is absent', () => {
    expect(
      getInitialComputeProvider({
        provider: 'cloud-run',
        providers: [{ value: 'lambda' }],
      }),
    ).toBe('lambda');
  });
});

describe('Cloud Run replica validation', () => {
  const baseCloudRunData = {
    provider: 'cloud-run' as const,
    lambdaArn: '',
    iamRoleArn: '',
    roleExternalId: '',
    gcpProject: 'test-project',
    gcpRegion: 'us-central1',
    gcpWorkerPool: 'test-pool',
    gcpServiceAccount: 'worker@test-project.iam.gserviceaccount.com',
  };

  it('applies replica defaults', () => {
    const result = editVersionSchema.parse(baseCloudRunData);

    expect(result.minReplicas).toBe(0);
    expect(result.maxReplicas).toBe(30);
    expect(result.initialReplicas).toBe(0);
    expect(result.utilizationTarget).toBe(0.8);
  });

  it.each([
    ['negative minimum', { minReplicas: -1, maxReplicas: 30 }],
    ['zero maximum', { minReplicas: 0, maxReplicas: 0 }],
    ['fractional minimum', { minReplicas: 0.5, maxReplicas: 30 }],
    ['fractional maximum', { minReplicas: 0, maxReplicas: 30.5 }],
    ['maximum above the backend limit', { maxReplicas: 2_147_483_648 }],
    ['minimum above maximum', { minReplicas: 31, maxReplicas: 30 }],
    [
      'initial below minimum',
      { minReplicas: 2, maxReplicas: 30, initialReplicas: 1 },
    ],
    [
      'initial above maximum',
      { minReplicas: 0, maxReplicas: 30, initialReplicas: 31 },
    ],
    ['zero utilization', { utilizationTarget: 0 }],
    ['utilization above one', { utilizationTarget: 1.01 }],
  ])('rejects %s', (_name, replicas) => {
    expect(
      editVersionSchema.safeParse({ ...baseCloudRunData, ...replicas }).success,
    ).toBe(false);
  });

  it('uses the same replica defaults when creating a deployment', () => {
    const result = createDeploymentSchema.parse({
      ...baseCloudRunData,
      name: 'test-deployment',
      buildId: 'v1',
    });

    expect(result).toMatchObject({
      minReplicas: 0,
      maxReplicas: 30,
      initialReplicas: 0,
      utilizationTarget: 0.8,
    });
  });
});
