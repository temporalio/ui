import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { SettingsResponse } from '$types';

export const fetchSettings = async (request = fetch): Promise<Settings> => {
  const settings: SettingsResponse = await requestFromAPI(
    routeForApi('settings'),
    { request },
  );

  return {
    auth: {
      enabled: !!settings?.Auth?.Enabled,
    },
    defaultNamespace: settings?.DefaultNamespace || 'default', // API returns an empty string if default namespace is not configured
  };
};
