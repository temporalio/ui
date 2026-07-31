type NamespaceWithClusters = {
  replicationConfig?: {
    activeClusterName?: string | null;
    clusters?: { clusterName?: string | null }[] | null;
  } | null;
};

export const getClusters = (namespace: NamespaceWithClusters): string => {
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
