import { Page } from '@playwright/test';
import type { SettingsResponse } from '../../src/lib/types';

export const apiUrl = 'http://localhost:8233/api/v1';
export const workflowsApi = apiUrl + '/namespaces/default/workflows?query=';
export const settingsApi = apiUrl + '/settings**';

const clusterApi = apiUrl + '/cluster**';
const namespaceApi = apiUrl + '/namespaces/**';

const clusterInfo = {
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

export const mockClusterApi = async (page: Page) => {
  await page.route(clusterApi, async (route) => {
    route.fulfill({ json: clusterInfo });
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
  await page.route(namespaceApi, async (route) => {
    route.fulfill({ json: archivalNamespace });
  });
};

const defaultSettings = {
  Auth: {
    Enabled: false,
    Options: null,
  },
  DefaultNamespace: '',
  ShowTemporalSystemNamespace: false,
  FeedbackURL: '',
  NotifyOnNewVersion: false,
  Codec: {
    Endpoint: '',
    PassAccessToken: false,
    IncludeCredentials: false,
    DecodeEventHistoryDownload: false,
  },
  Version: '2.15.0',
  DisableWriteActions: false,
  WorkflowTerminateDisabled: false,
  WorkflowCancelDisabled: false,
  WorkflowSignalDisabled: false,
  WorkflowResetDisabled: false,
  BatchActionsDisabled: false,
};

export const mockSettingsApi = async (
  page: Page,
  customSettings: Partial<SettingsResponse> = {},
) => {
  await page.route(settingsApi, async (route) => {
    route.fulfill({ json: { ...defaultSettings, ...customSettings } });
  });
};
