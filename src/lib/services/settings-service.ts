import { browser } from '$app/env';
import { getEnvironment } from '$lib/utilities/get-environment';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { SettingsResponse } from '$types';

const isCloudMatch = /tmprl\.cloud$/;

interface FetchSettingsInterface {
  url: URL;
}

export const fetchSettings = async (
  { url }: FetchSettingsInterface,
  request = fetch,
): Promise<Settings> => {
  const settings: SettingsResponse = await requestFromAPI(
    routeForApi('settings'),
    { request },
  );

  const EnvironmentOverride = getEnvironment();

  return {
    auth: {
      enabled: !!settings?.Auth?.Enabled,
      options: settings?.Auth?.Options,
    },
    baseUrl:
      import.meta?.env?.VITE_API ?? browser ? window.location.origin : '',
    codec: {
      endpoint: settings?.Codec?.Endpoint,
      accessToken: settings?.Codec?.AccessToken,
    },
    defaultNamespace: settings?.DefaultNamespace || 'default', // API returns an empty string if default namespace is not configured
    showTemporalSystemNamespace: settings?.ShowTemporalSystemNamespace,
    runtimeEnvironment: {
      get isCloud() {
        if (EnvironmentOverride) {
          return EnvironmentOverride === 'cloud';
        }

        return isCloudMatch.test(url.hostname);
      },
      get isLocal() {
        if (EnvironmentOverride) {
          return EnvironmentOverride === 'local';
        }

        return isCloudMatch.test(url.hostname);
      },
      envOverride: Boolean(EnvironmentOverride),
    },
    version: settings?.Version,
  };
};
