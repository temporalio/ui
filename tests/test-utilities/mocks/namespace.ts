import type { Page } from '@playwright/test';

export const NAMESPACE_API = /\/api\/v1\/namespaces\/[^/]+(\?.*)?$/;

const MOCK_ARCHIVED_NAMESPACE = {
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

const MOCK_DEFAULT_NAMESPACE = {
  namespaceInfo: {
    name: 'default',
    state: 'Registered',
    description: '',
    ownerEmail: '',
    data: {},
    id: 'bbe0d4ea-c682-4c5a-bc4b-fadb8e8c8bfe',
    supportsSchedules: true,
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
    customSearchAttributeAliases: {},
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
  failoverHistory: [],
};

export const mockNamespaceApi = (page: Page, archived = false) => {
  return page.route(NAMESPACE_API, (route) => {
    route.fulfill({
      json: archived ? MOCK_ARCHIVED_NAMESPACE : MOCK_DEFAULT_NAMESPACE,
    });
  });
};
