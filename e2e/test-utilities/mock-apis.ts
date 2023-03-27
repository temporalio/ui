import { Page } from '@playwright/test';

export const apiUrl = 'http://localhost:8233/api/v1';
export const namespacesApi = apiUrl + '/namespaces**';

const clusterApi = apiUrl + '/cluster**';
const namespacesInfo = {
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
    route.fulfill({ json: namespacesInfo });
  });
};
