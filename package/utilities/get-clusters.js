export const getClusters = (namespace) => {
    var _a, _b;
    const clusters = (_a = namespace === null || namespace === void 0 ? void 0 : namespace.replicationConfig) === null || _a === void 0 ? void 0 : _a.clusters;
    const activeCluster = (_b = namespace === null || namespace === void 0 ? void 0 : namespace.replicationConfig) === null || _b === void 0 ? void 0 : _b.activeClusterName;
    if (clusters === null || clusters === void 0 ? void 0 : clusters.length) {
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
