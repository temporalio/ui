import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { GetClusterInfoResponse } from '$types';

export const fetchCluster = async (
  request = fetch,
): Promise<GetClusterInfoResponse> => {
  return await requestFromAPI(routeForApi('cluster'), {
    request,
  });
};
