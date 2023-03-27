import { Page } from '@playwright/test';

export const apiUrl = 'http://localhost:8233/api/v1';
export const workflowsApi = apiUrl + '/namespaces/default/workflows?query=';
export const settingsApi = apiUrl + '/settings**';

const clusterApi = apiUrl + '/cluster**';
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
