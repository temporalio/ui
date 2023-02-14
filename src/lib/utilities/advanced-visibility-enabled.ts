import { isVersionNewer } from './version-check';

export const advancedVisibilityEnabled = (
  cluster: ClusterInformation,
  version: string,
) => {
  return (
    cluster?.visibilityStore?.includes('elasticsearch') ||
    isVersionNewer(version, '1.19')
  );
};

export const advancedVisibilityEnabledFully = (
  cluster: ClusterInformation,
  version: string,
) => {
  return (
    cluster?.visibilityStore?.includes('elasticsearch') ||
    isVersionNewer(version, '1.20.0')
  );
};
