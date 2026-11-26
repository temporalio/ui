import type { ClusterInformation } from '$lib/types/global';

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

export const advancedVisibilityEnabledWithOrderBy = (
  cluster: ClusterInformation,
) => {
  return cluster?.visibilityStore?.includes('elasticsearch');
};
