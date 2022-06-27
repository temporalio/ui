import { describe, expect, it } from 'vitest';
import { getDefaultNamespace, getNamespace } from './get-namespace';

const temporalSystemNamespace = {
  namespaceInfo: {
    name: 'temporal-system',
    state: 'Registered',
    description: 'Temporal internal system namespace',
    ownerEmail: 'temporal-core@temporal.io',
    data: {},
    id: '32049b68-7872-4094-8e63-d0dd59896a83',
  },
  config: {
    workflowExecutionRetentionTtl: '604800s',
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

const getSettings = (
  defaultNamespace: string,
  showTemporalSystemNamespace: boolean,
) => {
  return {
    auth: {
      enabled: false,
      options: ['organization', 'invitation', 'audience'],
    },
    defaultNamespace,
    showTemporalSystemNamespace,
  };
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

describe('getDefaultNamespace', () => {
  it('should return default namespace if it exists in namespaces and matches defaultNamespace setting', () => {
    const namespaces = [defaultNamespace];
    const settings = getSettings('default', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('default');
  });
  it('should return default namespace if it exists in namespaces and no defaultNamespace setting', () => {
    const namespaces = [defaultNamespace];
    const settings = getSettings('', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('default');
  });
  it('should return default namespace if it exists in namespaces and includes temporal system namespace with !ShowTemporalSystemNamespace', () => {
    const namespaces = [temporalSystemNamespace, defaultNamespace];
    const settings = getSettings('', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('default');
  });
  it('should return default namespace if it exists in namespaces and includes temporal system namespace with ShowTemporalSystemNamespace', () => {
    const namespaces = [temporalSystemNamespace, defaultNamespace];
    const settings = getSettings('', true);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual(
      'temporal-system',
    );
  });
  it('should return canary namespace if single namespace that does not match defaultNamespace setting', () => {
    const namespaces = [canaryNamespace];
    const settings = getSettings('default', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('canary');
  });
  it('should return default namespace if multiple namespaces and matching defaultNamespace setting', () => {
    const namespaces = [canaryNamespace, defaultNamespace];
    const settings = getSettings('default', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('default');
  });
  it('should return canary namespace if multiple namespaces and matching defaultNamespace setting', () => {
    const namespaces = [canaryNamespace, defaultNamespace];
    const settings = getSettings('canary', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('canary');
  });
  it('should return first namespace if multiple namespaces and no defaultNamespace setting', () => {
    const namespaces = [canaryNamespace, defaultNamespace];
    const settings = getSettings('', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('canary');
  });
  it('should return first namespace if multiple namespaces and no defaultNamespace setting and including ShowTemporalSystemNamespace', () => {
    const namespaces = [
      temporalSystemNamespace,
      canaryNamespace,
      defaultNamespace,
    ];
    const settings = getSettings('', true);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual(
      'temporal-system',
    );
  });
  it('should return defaultNamespace setting if no namespaces', () => {
    const namespaces = [];
    const settings = getSettings('default', false);
    expect(getDefaultNamespace({ namespaces, settings })).toEqual('default');
  });
});
