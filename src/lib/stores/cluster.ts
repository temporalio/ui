import { writable } from 'svelte/store';

import { fetchCluster } from '$lib/services/cluster-service';
import type { GetClusterInfoResponse } from '$types';

export const cluster = writable<GetClusterInfoResponse>({});

const loadCluster = async (): Promise<void> => {
  const clusterRes = await fetchCluster();
  cluster.set(clusterRes);
};

loadCluster();
