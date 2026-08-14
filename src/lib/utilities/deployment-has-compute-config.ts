import {
  type ComputeConfig,
  type DescribeWorkerDeployment,
  isVersionSummaryNew,
  type ListWorkerDeployment,
  type RoutingConfig,
  type VersionSummary,
  type WorkerDeploymentVersion,
} from '$lib/types/deployments';

import {
  getBuildIdFromVersion,
  getDeploymentFromVersion,
} from './get-deployment-build-id';

const hasScalingGroups = (config?: ComputeConfig): boolean =>
  Object.keys(config?.scalingGroups ?? {}).length > 0;

const matchesVersion = (
  summary: VersionSummary,
  version: WorkerDeploymentVersion | undefined,
): boolean => {
  if (!version) return false;

  const deploymentName = isVersionSummaryNew(summary)
    ? summary.deploymentVersion.deploymentName
    : getDeploymentFromVersion(summary.version);
  const buildId = isVersionSummaryNew(summary)
    ? summary.deploymentVersion.buildId
    : getBuildIdFromVersion(summary.version);

  return (
    deploymentName === version.deploymentName && buildId === version.buildId
  );
};

// DescribeWorkerDeployment does not return current/ramping version summaries —
// those only exist on ListWorkerDeployments — so the active versions have to be
// resolved out of versionSummaries using the routing config.
const activeVersionComputeConfigs = (
  versionSummaries: VersionSummary[] = [],
  routingConfig: RoutingConfig = {},
): (ComputeConfig | undefined)[] =>
  versionSummaries
    .filter(
      (summary) =>
        matchesVersion(summary, routingConfig.currentDeploymentVersion) ||
        matchesVersion(summary, routingConfig.rampingDeploymentVersion),
    )
    .map((summary) =>
      isVersionSummaryNew(summary) ? summary.computeConfig : undefined,
    );

export const deploymentHasComputeConfig = (
  deployment?: ListWorkerDeployment | DescribeWorkerDeployment,
): boolean => {
  if (!deployment) return false;

  if ('versionSummaries' in deployment) {
    return activeVersionComputeConfigs(
      deployment.versionSummaries,
      deployment.routingConfig,
    ).some(hasScalingGroups);
  }

  return [
    deployment.currentVersionSummary?.computeConfig,
    deployment.rampingVersionSummary?.computeConfig,
  ].some(hasScalingGroups);
};
