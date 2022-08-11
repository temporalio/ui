import { readable } from 'svelte/store';

interface Page<Params extends Record<string, string> = Record<string, string>> {
  url: URL;
  params: Params;
  routeId: string | null;
  stuff: App.Stuff;
  status: number;
  error: Error | null;
}

const settings: Settings = {
  auth: {
    enabled: false,
    options: null,
  },
  baseUrl: 'http://localhost:3000',
  codec: {
    endpoint: '',
    accessToken: '',
  },
  defaultNamespace: 'default',
  disableWriteActions: false,
  showTemporalSystemNamespace: false,
  notifyOnNewVersion: true,
  feedbackURL: '',
  runtimeEnvironment: {
    isCloud: false,
    isLocal: true,
    envOverride: true,
  },
  version: '2.0.0',
};

const stuff: App.Stuff = {
  namespaces: [
    {
      namespaceInfo: {
        name: 'my-namespace-name',
        state: 'Registered',
        description: '',
        ownerEmail: '',
        data: {},
        id: '2f3e9cc5-13e0-43fb-805f-adc817fe8b7c',
      },
      config: {
        workflowExecutionRetentionTtl: '259200s',
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
    },
    {
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
    },
    {
      namespaceInfo: {
        name: 'default',
        state: 'Registered',
        description: 'Default namespace for Temporal Server.',
        ownerEmail: '',
        data: {},
        id: 'a0f1d023-7f0f-4189-a8a5-510f603569c8',
      },
      config: {
        workflowExecutionRetentionTtl: '86400s',
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
    },
    {
      namespaceInfo: {
        name: 'canary',
        state: 'Registered',
        description: 'Namespace for running temporal canary workflows',
        ownerEmail: 'canary',
        data: {},
        id: 'c3e6ec56-8059-4bdf-99ac-d50d3fa1616c',
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
    },
  ],
  settings,
};

export const page = readable<Page>({
  error: null,
  params: {
    namespace: 'default',
  },
  routeId: 'namespaces/[namespace]/workflows@root',
  status: 200,
  stuff,
  url: new URL(
    'http://localhost:3000/namespaces/default/workflows?search=basic&query=WorkflowType%3D%22testing%22',
  ),
});
