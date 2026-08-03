import type {
  ComputeProviderOption,
  ComputeProviderValue,
} from '$lib/components/workers/serverless-worker-form/shared';
import type {
  ComputeConfig,
  WorkerDeploymentInfo,
} from '$lib/types/deployments';

export type LockedComputeProvider = {
  provider: ComputeProviderValue;
  providers: readonly ComputeProviderOption[];
};

const providerValue = (type?: string): ComputeProviderValue | undefined => {
  if (type === 'aws-lambda' || type === 'lambda') return 'lambda';
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

export const lockComputeProvider = (
  deployment: WorkerDeploymentInfo,
  configuredProviders?: readonly ComputeProviderOption[],
): LockedComputeProvider | undefined => {
  const versionSummaries = deployment.versionSummaries ?? [];
  if (!versionSummaries.length) return;

  const configs = [
    deployment.computeConfig,
    computeConfigOf(deployment.latestVersionSummary),
    computeConfigOf(deployment.currentVersionSummary),
    computeConfigOf(deployment.rampingVersionSummary),
    ...versionSummaries.map((version) =>
      'computeConfig' in version ? computeConfigOf(version) : undefined,
    ),
  ].filter((config): config is ComputeConfig => Boolean(config));

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
  const source = configuredProviders ?? [
    { value: 'lambda' as const },
    { value: 'cloud-run' as const },
  ];
  const configuredProvider = source.find(({ value }) => value === provider);
  if (
    !configuredProvider ||
    configuredProvider.hidden ||
    configuredProvider.disabled
  ) {
    return;
  }

  return {
    provider,
    providers: source.map((option) =>
      option.value === provider ? option : { ...option, hidden: true },
    ),
  };
};
