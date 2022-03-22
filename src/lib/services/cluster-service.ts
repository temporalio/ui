import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { GetClusterInfoResponse } from '$types';

export const fetchCluster = async (
  settings: Settings,
  request = fetch,
): Promise<GetClusterInfoResponse> => {
  if (settings.runtimeEnvironment.isCloud) return;

  return await requestFromAPI(routeForApi('cluster'), {
    request,
  });
};
