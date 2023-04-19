import { cluster } from '$lib/stores/cluster';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { GetClusterInfoResponse } from '$lib/types';
import type { Settings } from '$lib/types/global';

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
