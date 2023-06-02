import { Page } from '@playwright/test';

export const apiUrl = 'http://localhost:8233/api/v1';

export const clusterApi = apiUrl + '/cluster**';
export const namespacesApi = apiUrl + '/namespaces**';
export const workflowsApi = apiUrl + '/namespaces/default/workflows?query=';
export const settingsApi = apiUrl + '/settings**';

const cluster = {
  supportedClients: {
    'temporal-cli': '\u003c2.0.0',
    'temporal-go': '\u003c2.0.0',
    'temporal-java': '\u003c2.0.0',
    'temporal-php': '\u003c2.0.0',
    'temporal-server': '\u003c2.0.0',
    'temporal-typescript': '\u003c2.0.0',
    'temporal-ui': '\u003c3.0.0',
  },
  serverVersion: '1.19.3',
  clusterId: 'f2f23e30-2294-4bf8-a5ec-b505259f30c9',
  versionInfo: null,
  clusterName: 'active',
  historyShardCount: 1,
  persistenceStore: 'sqlite',
  visibilityStore: 'sqlite',
};

const namespaces = {
  namespaces: [
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
        id: '398cb3a0-112f-4a36-991c-766dd8001649',
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
        activeClusterName: 'us-east1',
        clusters: [
          {
            clusterName: 'us-east1',
          },
          {
            clusterName: 'us-east2',
          },
        ],
        state: 'Unspecified',
      },
      failoverVersion: '0',
      isGlobalNamespace: false,
    },
    {
      namespaceInfo: {
        name: 'some-other-namespace',
        state: 'Registered',
        description: '',
        ownerEmail: '',
        data: {},
        id: '5411056f-9bd0-4b4e-90fa-e88e3031a0d0',
      },
      config: {
        workflowExecutionRetentionTtl: '259200s',
        badBinaries: {
          binaries: {},
        },
        historyArchivalState: 'Enabled',
        historyArchivalUri: '',
        visibilityArchivalState: 'Enabled',
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
  nextPageToken: null,
};

export const mockNamespacesApi = async (page: Page) => {
  await page.route(namespacesApi, async (route) => {
    route.fulfill({ json: namespaces });
  });
};

export const mockClusterApi = async (page: Page) => {
  await page.route(clusterApi, async (route) => {
    route.fulfill({ json: cluster });
  });
};

const archivalNamespace = {
  namespaceInfo: {
    name: 'some-archived-namespace',
    state: 'Registered',
    description: '',
    ownerEmail: '',
    data: {},
    id: '5411056f-9bd0-4b4e-90fa-e88e3031a0d0',
  },
  config: {
    workflowExecutionRetentionTtl: '259200s',
    badBinaries: {
      binaries: {},
    },
    historyArchivalState: 'Enabled',
    historyArchivalUri: '',
    visibilityArchivalState: 'Enabled',
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

export const mockNamespaceApi = async (page: Page) => {
  await page.route(namespacesApi, async (route) => {
    route.fulfill({ json: archivalNamespace });
  });
};
