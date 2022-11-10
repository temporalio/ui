export const advancedVisibilityEnabled = (cluster: ClusterInformation) => {
  return cluster.visibilityStore.includes('elasticsearch');
};
