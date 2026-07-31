import type { ComputeConfig } from '$lib/types/deployments';

const hasScalingGroups = (config?: ComputeConfig): boolean =>
  Object.keys(config?.scalingGroups ?? {}).length > 0;

type VersionWithComputeConfig = {
  computeConfig?: ComputeConfig;
  version?: string;
  createTime?: unknown;
};

export const deploymentHasComputeConfig = (deployment?: {
  computeConfig?: ComputeConfig;
  currentVersionSummary?: VersionWithComputeConfig | null;
  rampingVersionSummary?: VersionWithComputeConfig | null;
  latestVersionSummary?: VersionWithComputeConfig | null;
  versionSummaries?: VersionWithComputeConfig[];
}): boolean => {
  if (!deployment) return false;

  return [
    deployment.computeConfig,
    deployment.currentVersionSummary?.computeConfig,
    deployment.rampingVersionSummary?.computeConfig,
  ].some(hasScalingGroups);
};
