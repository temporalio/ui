import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { ComponentVersions } from '$lib/utilities/upgrade-notice';

type LatestReleasesResponse = {
  Releases?: ComponentVersions;
};

export const fetchLatestReleases = async (
  request = fetch,
): Promise<ComponentVersions> => {
  try {
    const response = await requestFromAPI<LatestReleasesResponse>(
      routeForApi('releases'),
      { request, notifyOnError: false },
    );
    return response?.Releases ?? {};
  } catch {
    return {};
  }
};
