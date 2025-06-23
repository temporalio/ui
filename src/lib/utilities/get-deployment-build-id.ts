import {
  isVersionSummaryNew,
  type VersionSummary,
} from '$lib/types/deployments';

export const getBuildIdFromVersion = (version: string | undefined): string => {
  if (!version) return '';
  const newDelimiter = version.split(':')[1];
  if (newDelimiter) return newDelimiter;
  const oldDelimiter = version.split('.')[1];
  if (oldDelimiter) return oldDelimiter;
  return version;
};

export const getDeploymentFromVersion = (
  version: string | undefined,
): string => {
  if (!version) return '';
  const newDelimiter = version.split(':')[0];
  if (newDelimiter) return newDelimiter;
  const oldDelimiter = version.split('.')[0];
  if (oldDelimiter) return oldDelimiter;
  return version;
};

export const getDeploymentVersionFromStruct = (version: VersionSummary) => {
  if (isVersionSummaryNew(version) && version.deploymentVersion) {
    return `${version.deploymentVersion.deploymentName}:${version.deploymentVersion.buildId}`;
  }
  return `${version.version}`;
};
