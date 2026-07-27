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

  return [
    deployment.computeConfig,
    deployment.currentVersionSummary?.computeConfig,
    deployment.rampingVersionSummary?.computeConfig,
  ].some(hasScalingGroups);
};
