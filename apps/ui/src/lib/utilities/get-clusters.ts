import type { DescribeNamespaceResponse } from '$lib/types';

export const getClusters = (namespace: DescribeNamespaceResponse): string => {
  const clusters = namespace?.replicationConfig?.clusters;
  const activeCluster = namespace?.replicationConfig?.activeClusterName;
  if (clusters?.length) {
    return clusters
      .map(({ clusterName }) => {
        if (clusterName === activeCluster) {
          return `${clusterName} (active)`;
        }
        return clusterName;
      })
      .join(', ');
  }
  return 'Unknown';
};
