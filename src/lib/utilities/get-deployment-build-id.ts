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
  const newDelimiter = version.split(':');
  if (newDelimiter && newDelimiter.length === 2) return newDelimiter[0];
  const oldDelimiter = version.split('.');
  if (oldDelimiter && oldDelimiter.length === 2) return oldDelimiter[0];
  return version;
};

export const getDeploymentVersionFromStruct = (version: VersionSummary) => {
  if (isVersionSummaryNew(version) && version.deploymentVersion) {
    return `${version.deploymentVersion.deploymentName}:${version.deploymentVersion.buildId}`;
  }
  return `${version.version}`;
};
