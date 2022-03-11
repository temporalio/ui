import { writable } from 'svelte/store';

import { fetchCluster } from '$lib/services/cluster-service';
import type { GetClusterInfoResponse } from '$types';
import { isCloud } from '$lib/utilities/env';

export const cluster = writable<GetClusterInfoResponse>({});

export const loadCluster = async (): Promise<void> => {
  if (isCloud()) {
    return Promise.resolve();
  }
  const clusterRes = await fetchCluster();
  cluster.set(clusterRes);
};
