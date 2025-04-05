import { describe, expect, it } from 'vitest';

import { getClusters } from './get-clusters';

const getNamespace = (clusters: string[], activeClusterName: string) => ({
  namespaceInfo: {
    name: 'default',
    state: 'Registered',
    description: 'Default namespace',
    ownerEmail: 'default',
    data: {},
    id: '6879d26a-d9ad-486b-a572-b11aeed816e8',
  },
  config: {
    workflowExecutionRetentionTtl: '864000s',
    badBinaries: {
      binaries: {},
    },
    historyArchivalState: 'Disabled',
    historyArchivalUri: '',
    visibilityArchivalState: 'Disabled',
    visibilityArchivalUri: '',
  },
  replicationConfig: {
    activeClusterName,
    clusters: clusters.map((clusterName) => ({ clusterName })),
    state: 'Unspecified',
  },
  failoverVersion: '0',
  isGlobalNamespace: false,
});

describe('getClusters', () => {
  it('should return single active cluster', () => {
    const namespace = getNamespace(['us-east'], 'us-east');
    const clusters = getClusters(namespace);
    expect(clusters).toEqual('us-east (active)');
  });
  it('should return multiple clusters with active cluster', () => {
    const namespace = getNamespace(['us-east', 'eu-west', 'au-1'], 'eu-west');
    const clusters = getClusters(namespace);
    expect(clusters).toEqual('us-east, eu-west (active), au-1');
  });
  it('should return multiple clusters with no active cluster', () => {
    const namespace = getNamespace(['us-east', 'eu-west', 'au-1'], '');
    const clusters = getClusters(namespace);
    expect(clusters).toEqual('us-east, eu-west, au-1');
  });
  it('should return "Unknown" if no clusters', () => {
    const namespace = getNamespace([], 'active');
    const clusters = getClusters(namespace);
    expect(clusters).toEqual('Unknown');
  });
});
