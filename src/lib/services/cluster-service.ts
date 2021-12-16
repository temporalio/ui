import { requestFromAPI } from '$lib/utilities/request-from-api';
import type { GetClusterInfoResponse } from '$types';

export const fetchCluster = async (
  request = fetch,
): Promise<GetClusterInfoResponse> => {
  return await requestFromAPI('/cluster', {
    request,
  });
};
