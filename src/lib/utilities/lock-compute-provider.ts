import type {
  ComputeProviderOption,
  ComputeProviderValue,
} from '$lib/components/workers/serverless-worker-form/shared';
import type {
  ComputeConfig,
  DescribeWorkerDeployment,
} from '$lib/types/deployments';

export type LockedComputeProvider = {
  provider: ComputeProviderValue;
  providers: readonly ComputeProviderOption[];
};

const providerValue = (type?: string): ComputeProviderValue | undefined => {
  if (type === 'aws-lambda' || type === 'lambda') return 'lambda';
  if (type === 'aws-agentcore' || type === 'agentcore') return 'agentcore';
  if (type === 'gcp-cloud-run' || type === 'cloud-run') return 'cloud-run';
};

const computeConfigOf = (summary?: { computeConfig?: ComputeConfig }) =>
  summary?.computeConfig;

const providersInConfig = (
  config: ComputeConfig,
): ComputeProviderValue[] | undefined => {
  const groups = Object.values(config.scalingGroups ?? {});
  if (!groups.length) return;

  const providers = groups.map((group) =>
    providerValue(group.providerType ?? group.provider?.type),
  );
  if (providers.some((provider) => !provider)) return;
  return providers as ComputeProviderValue[];
};

const DEFAULT_PROVIDERS: readonly ComputeProviderOption[] = [
  { value: 'lambda' },
  { value: 'agentcore' },
  { value: 'cloud-run' },
];

/**
 * Ungates the provider a Version already uses, leaving the alternatives alone.
 * Exported for tests and for callers that want the ungating without the
 * hiding; `lockProvidersTo` is what the Version forms use.
 */
export const allowProviderInUse = (
  provider: ComputeProviderValue,
  configuredProviders?: readonly ComputeProviderOption[],
): readonly ComputeProviderOption[] => {
  const source = configuredProviders ?? DEFAULT_PROVIDERS;
  const known = source.some(({ value }) => value === provider);
  const options = known ? source : [...source, { value: provider }];

  return options.map((option) => {
    if (option.value !== provider) return option;

    const {
      disabled: _disabled,
      disabledReason: _disabledReason,
      hidden: _hidden,
      ...usable
    } = option;

    return usable;
  });
};

/**
 * The provider options to show for a Version that already has one.
 *
 * A Version's provider cannot be changed, so only the provider in use is
 * shown: offering alternatives that cannot be applied is a worse lie than the
 * one this replaces. It is also always selectable and keeps its release stage,
 * because a Version already running on a provider is proof the provider works,
 * and a card that is selected, disabled, and badged "Coming Soon" at once says
 * otherwise.
 */
export const lockProvidersTo = (
  provider: ComputeProviderValue,
  configuredProviders?: readonly ComputeProviderOption[],
): readonly ComputeProviderOption[] =>
  allowProviderInUse(provider, configuredProviders).map((option) =>
    option.value === provider ? option : { ...option, hidden: true },
  );

export const lockComputeProvider = (
  deployment: DescribeWorkerDeployment,
  configuredProviders?: readonly ComputeProviderOption[],
): LockedComputeProvider | undefined => {
  const versionSummaries = deployment.versionSummaries ?? [];
  if (!versionSummaries.length) return;

  const configs = versionSummaries
    .map((version) =>
      'computeConfig' in version ? computeConfigOf(version) : undefined,
    )
    .filter((config): config is ComputeConfig => Boolean(config));

  if (!configs.length) return;

  const providers = configs.flatMap(
    (config) => providersInConfig(config) ?? [],
  );
  if (
    providers.length === 0 ||
    configs.some((config) => !providersInConfig(config)) ||
    new Set(providers).size !== 1
  ) {
    return;
  }

  const provider = providers[0];
  const source = configuredProviders ?? DEFAULT_PROVIDERS;
  if (!source.some(({ value }) => value === provider)) return;

  return { provider, providers: lockProvidersTo(provider, source) };
};
