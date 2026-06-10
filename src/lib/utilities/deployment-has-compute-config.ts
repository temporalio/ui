import type {
  ComputeConfig,
  WorkerDeploymentInfo,
} from '$lib/types/deployments';

const hasScalingGroups = (config?: ComputeConfig): boolean =>
  Object.keys(config?.scalingGroups ?? {}).length > 0;

export const deploymentHasComputeConfig = (
  deployment?: WorkerDeploymentInfo,
): boolean => {
  if (!deployment) return false;

  const versionConfigs = (deployment.versionSummaries ?? []).map((summary) =>
    'computeConfig' in summary ? summary.computeConfig : undefined,
  );

  return [
    deployment.computeConfig,
    deployment.latestVersionSummary?.computeConfig,
    deployment.currentVersionSummary?.computeConfig,
    deployment.rampingVersionSummary?.computeConfig,
    ...versionConfigs,
  ].some(hasScalingGroups);
};
