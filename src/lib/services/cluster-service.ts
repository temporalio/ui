import { cluster } from '$lib/stores/cluster';
import type { GetClusterInfoResponse } from '$lib/types';
import type { Settings } from '$lib/types/global';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchCluster = async (
  settings: Settings,
  request = fetch,
): Promise<GetClusterInfoResponse> => {
  if (settings.runtimeEnvironment.isCloud) return;

  const route = routeForApi('cluster');
  return await requestFromAPI(route, {
    request,
  }).then((clusterInformation) => {
    cluster.set(clusterInformation);
    return clusterInformation;
  });
};
