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

// Add isVersionNewer check when we know when orderBy is supported
export const advancedVisibilityEnabledWithOrderBy = (
  cluster: ClusterInformation,
) => {
  return cluster?.visibilityStore?.includes('elasticsearch');
};
