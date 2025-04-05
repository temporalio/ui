import { describe, expect, it } from 'vitest';

import { getNamespace } from './get-namespace';

const canaryNamespace = {
  namespaceInfo: {
    name: 'canary',
    state: 'Registered',
    description: 'Namespace for running temporal canary workflows',
    ownerEmail: 'canary',
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
    activeClusterName: 'active',
    clusters: [
      {
        clusterName: 'active',
      },
    ],
    state: 'Unspecified',
  },
  failoverVersion: '0',
  isGlobalNamespace: false,
};

const defaultNamespace = {
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
    activeClusterName: 'active',
    clusters: [
      {
        clusterName: 'active',
      },
    ],
    state: 'Unspecified',
  },
  failoverVersion: '0',
  isGlobalNamespace: false,
};

describe('getNamespace', () => {
  it('should return default namespace if no namespace given', () => {
    const namespaces = [defaultNamespace, canaryNamespace];
    expect(getNamespace({ namespaces, defaultNamespace: 'default' })).toEqual(
      'default',
    );
  });

  it('should return default namespace if no namespaces given', () => {
    const namespaces = [];
    expect(getNamespace({ namespaces, defaultNamespace: 'default' })).toEqual(
      'default',
    );
  });

  it('should return default namespace if no namespaces given, but a namespace was provided', () => {
    const namespaces = [];
    expect(
      getNamespace({
        namespace: 'default',
        namespaces,
        defaultNamespace: 'default',
      }),
    ).toEqual('default');
  });

  it('should return namespace if namespace exists in namespaces given', () => {
    const namespaces = [defaultNamespace, canaryNamespace];
    expect(
      getNamespace({
        namespaces,
        defaultNamespace: 'default',
        namespace: 'canary',
      }),
    ).toEqual('canary');
  });

  it('should return undefined if namespace does not exist in namespaces given', () => {
    const namespaces = [defaultNamespace, canaryNamespace];
    expect(
      getNamespace({
        namespaces,
        defaultNamespace: 'default',
        namespace: 'cats',
      }),
    ).toEqual(undefined);
  });
});
