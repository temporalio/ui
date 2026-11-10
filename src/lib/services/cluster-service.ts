import type { GetClusterInfoResponse, GetSystemInfoResponse } from '$lib/types';
import type { Settings } from '$lib/types/global';
import { handleError, isForbidden } from '$lib/utilities/handle-error';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchCluster = async (
  settings: Settings,
  request = fetch,
): Promise<GetClusterInfoResponse> => {
  if (settings.runtimeEnvironment.isCloud) return {};

  const route = routeForApi('cluster');
  try {
    const clusterInformation = await requestFromAPI<GetClusterInfoResponse>(
      route,
      { request, notifyOnError: false },
    );
    return clusterInformation ?? {};
  } catch (error) {
    if (!isForbidden(error)) handleError(error);
    return {};
  }
};

export const fetchSystemInfo = async (
  settings: Settings,
  request = fetch,
): Promise<GetSystemInfoResponse> => {
  if (settings.runtimeEnvironment.isCloud) return {};

  const route = routeForApi('systemInfo');
  return await requestFromAPI<GetSystemInfoResponse>(route, {
    request,
  }).then((systemInformation) => {
    return systemInformation ?? {};
  });
};
