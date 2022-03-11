import { writable } from 'svelte/store';

import { fetchCluster } from '$lib/services/cluster-service';
import type { GetClusterInfoResponse } from '$types';

export const cluster = writable<GetClusterInfoResponse>({});

export const loadCluster = async (settings: Settings): Promise<void> => {
  if (settings.runtimeEnvironment.isCloud) {
    return Promise.resolve();
  }
  const clusterRes = await fetchCluster();
  cluster.set(clusterRes);
};
