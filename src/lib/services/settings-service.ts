import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchSettings = async (request = fetch): Promise<Settings> => {
  const settings: { Auth: { Enabled: boolean } } = await requestFromAPI(
    routeForApi('settings'),
    { request },
  );

  return {
    auth: {
      enabled: settings?.Auth?.Enabled,
    },
  };
};
