import type { GetClusterInfoResponse, GetSystemInfoResponse } from '$lib/types';
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
    return clusterInformation;
  });
};

export const fetchSystemInfo = async (
  settings: Settings,
  request = fetch,
): Promise<GetSystemInfoResponse> => {
  if (settings.runtimeEnvironment.isCloud) return;

  const route = routeForApi('systemInfo');
  return await requestFromAPI(route, {
    request,
  }).then((systemInformation) => {
    return systemInformation;
  });
};
