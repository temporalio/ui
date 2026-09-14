import { describe, expect, it } from 'vitest';

import type { DescribeWorkerDeployment } from '$lib/types/deployments';

import { lockComputeProvider } from './lock-compute-provider';

const deployment = (types: (string | undefined)[]): DescribeWorkerDeployment =>
  ({
    name: 'test-deployment',
    createTime: '',
    routingConfig: {},
    lastModifierIdentity: '',
    versionSummaries: types.map((type, index) => ({
      version: `build-${index}`,
      createTime: '',
      computeConfig: {
        scalingGroups: { default: { provider: { type } } },
      },
    })),
  }) satisfies DescribeWorkerDeployment;

describe('lockComputeProvider', () => {
  it('does not lock deployments without versions', () => {
    expect(lockComputeProvider(deployment([]))).toBeUndefined();
  });

  it('tolerates deployment responses without version summaries', () => {
    const info = deployment([]);
    Object.assign(info, { versionSummaries: undefined });

    expect(lockComputeProvider(info)).toBeUndefined();
  });

  it('locks all alternatives to the provider used by existing versions', () => {
    expect(lockComputeProvider(deployment(['aws-lambda']))).toEqual({
      provider: 'lambda',
      providers: [{ value: 'lambda' }, { value: 'cloud-run', hidden: true }],
    });
  });

  it('preserves metadata on the matching configured provider', () => {
    const providers = [
      { value: 'lambda' as const },
      {
        value: 'cloud-run' as const,
        disabled: false,
        disabledReason: 'Available',
      },
    ];

    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), providers),
    ).toEqual({
      provider: 'cloud-run',
      providers: [{ value: 'lambda', hidden: true }, providers[1]],
    });
  });

  it('fails closed when the existing provider is excluded by configuration', () => {
    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), [{ value: 'lambda' }]),
    ).toBeUndefined();

    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), [
        { value: 'lambda' },
        { value: 'cloud-run', hidden: true },
      ]),
    ).toBeUndefined();

    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), [
        { value: 'lambda' },
        { value: 'cloud-run', disabled: true },
      ]),
    ).toBeUndefined();
  });

  it.each([[['aws-lambda', 'gcp-cloud-run']], [['unknown']], [[undefined]]])(
    'rejects mixed, unknown, or missing providers',
    (types) => {
      expect(lockComputeProvider(deployment(types))).toBeUndefined();
    },
  );

  it('supports providerType', () => {
    const info = deployment(['aws-lambda']);
    const version = info.versionSummaries[0];
    const group =
      'computeConfig' in version
        ? version.computeConfig?.scalingGroups?.default
        : undefined;
    if (group) {
      group.providerType = 'gcp-cloud-run';
      group.provider = undefined;
    }

    expect(lockComputeProvider(info)?.provider).toBe('cloud-run');
  });

  it.each([
    ['lambda', 'lambda'],
    ['aws-lambda', 'lambda'],
    ['cloud-run', 'cloud-run'],
    ['gcp-cloud-run', 'cloud-run'],
  ] as const)('maps the %s provider type to %s', (type, provider) => {
    expect(lockComputeProvider(deployment([type]))?.provider).toBe(provider);
  });
});
