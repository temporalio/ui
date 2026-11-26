import { describe, expect, it } from 'vitest';

import type { DescribeWorkerDeployment } from '$lib/types/deployments';

import {
  allowProviderInUse,
  lockComputeProvider,
  lockProvidersTo,
} from './lock-compute-provider';

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
      providers: [
        { value: 'lambda' },
        { value: 'agentcore', hidden: true },
        { value: 'cloud-run', hidden: true },
      ],
    });
  });

  it('locks all alternatives to AgentCore when versions use it', () => {
    expect(lockComputeProvider(deployment(['aws-agentcore']))).toEqual({
      provider: 'agentcore',
      providers: [
        { value: 'lambda', hidden: true },
        { value: 'agentcore' },
        { value: 'cloud-run', hidden: true },
      ],
    });
  });

  // Metadata that stays true is kept; the gating fields are dropped, because
  // the provider is in use and so cannot be unavailable.
  it('keeps release stage on the matching provider and drops its gating', () => {
    const providers = [
      { value: 'lambda' as const },
      {
        value: 'cloud-run' as const,
        releaseStage: 'pre-release' as const,
        disabled: true,
        disabledReason: 'Coming Soon',
      },
    ];

    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), providers),
    ).toEqual({
      provider: 'cloud-run',
      providers: [
        { value: 'lambda', hidden: true },
        { value: 'cloud-run', releaseStage: 'pre-release' },
      ],
    });
  });

  it('fails closed when configuration does not know the existing provider', () => {
    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), [{ value: 'lambda' }]),
    ).toBeUndefined();
  });

  // A Version already running on a provider is proof the provider works, so
  // gating must not describe it as unavailable. Previously this fell back to
  // the gated list and rendered the provider in use selected, disabled, and
  // badged "Coming Soon".
  it('offers a configured provider that gating would otherwise disable', () => {
    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), [
        { value: 'lambda' },
        { value: 'cloud-run', disabled: true, disabledReason: 'Coming Soon' },
      ]),
    ).toEqual({
      provider: 'cloud-run',
      providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
    });
  });

  it('offers a configured provider that gating would otherwise hide', () => {
    expect(
      lockComputeProvider(deployment(['gcp-cloud-run']), [
        { value: 'lambda' },
        { value: 'cloud-run', hidden: true },
      ]),
    ).toEqual({
      provider: 'cloud-run',
      providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
    });
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

describe('lockProvidersTo', () => {
  it('shows only the provider in use, and shows it as usable', () => {
    expect(
      lockProvidersTo('agentcore', [
        { value: 'lambda' },
        { value: 'agentcore', disabled: true, disabledReason: 'Coming Soon' },
        { value: 'cloud-run', disabled: true, disabledReason: 'Coming Soon' },
      ]),
    ).toEqual([
      { value: 'lambda', hidden: true },
      { value: 'agentcore' },
      {
        value: 'cloud-run',
        hidden: true,
        disabled: true,
        disabledReason: 'Coming Soon',
      },
    ]);
  });

  // The stage stays true whether or not the Service advertises the provider.
  it('keeps the release stage', () => {
    expect(
      lockProvidersTo('agentcore', [
        { value: 'agentcore', releaseStage: 'pre-release', disabled: true },
      ]),
    ).toEqual([{ value: 'agentcore', releaseStage: 'pre-release' }]);
  });

  it('falls back to the known providers when none are configured', () => {
    expect(lockProvidersTo('lambda')).toEqual([
      { value: 'lambda' },
      { value: 'agentcore', hidden: true },
      { value: 'cloud-run', hidden: true },
    ]);
  });

  it('adds a provider the configuration omits, rather than showing nothing', () => {
    expect(lockProvidersTo('agentcore', [{ value: 'lambda' }])).toEqual([
      { value: 'lambda', hidden: true },
      { value: 'agentcore' },
    ]);
  });
});

describe('allowProviderInUse', () => {
  const gated = [
    { value: 'lambda' as const },
    {
      value: 'agentcore' as const,
      releaseStage: 'pre-release' as const,
      disabled: true,
      disabledReason: 'Coming Soon',
    },
    {
      value: 'cloud-run' as const,
      disabled: true,
      disabledReason: 'Coming Soon',
    },
  ];

  // provider.type is an accepted update path on
  // UpdateWorkerDeploymentVersionComputeConfig, so switching a Version to
  // another provider is a real choice and the alternatives must stay visible.
  it('ungates the provider in use and leaves the alternatives alone', () => {
    expect(allowProviderInUse('agentcore', gated)).toEqual([
      { value: 'lambda' },
      { value: 'agentcore', releaseStage: 'pre-release' },
      { value: 'cloud-run', disabled: true, disabledReason: 'Coming Soon' },
    ]);
  });

  it('leaves an already usable provider untouched', () => {
    expect(allowProviderInUse('lambda', gated)).toEqual(gated);
  });

  it('adds a provider the configuration omits, rather than showing nothing', () => {
    expect(allowProviderInUse('agentcore', [{ value: 'lambda' }])).toEqual([
      { value: 'lambda' },
      { value: 'agentcore' },
    ]);
  });
});
