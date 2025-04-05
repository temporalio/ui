import type { Page } from '@playwright/test';

import type { GetClusterInfoResponse as Cluster } from '$src/lib/types';

export const CLUSTER_API = '**/api/v1/cluster-info?';

const MOCK_CLUSTER: Cluster = {
  supportedClients: {
    'temporal-cli': '\u003c2.0.0',
    'temporal-go': '\u003c2.0.0',
    'temporal-java': '\u003c2.0.0',
    'temporal-php': '\u003c2.0.0',
    'temporal-server': '\u003c2.0.0',
    'temporal-typescript': '\u003c2.0.0',
    'temporal-ui': '\u003c3.0.0',
  },
  serverVersion: '1.22.0',
  clusterId: 'f2f23e30-2294-4bf8-a5ec-b505259f30c9',
  versionInfo: null,
  clusterName: 'active',
  historyShardCount: 1,
  persistenceStore: 'sqlite',
  visibilityStore: 'sqlite',
};

export const mergeCluster = (cluster: Partial<Cluster>): Cluster => {
  return {
    ...MOCK_CLUSTER,
    ...cluster,
  };
};

export const mockClusterApi = async (
  page: Page,
  cluster?: Partial<Cluster>,
) => {
  return page.route(CLUSTER_API, async (route) => {
    route.fulfill({ json: mergeCluster(cluster) });
  });
};
