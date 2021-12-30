import { requestFromAPI } from '$lib/utilities/request-from-api';

export const fetchSettings = async (request = fetch): Promise<Settings> => {
  const settings: { Auth: { Enabled: boolean } } = await requestFromAPI(
    `/settings`,
    { request },
  );

  return {
    auth: {
      enabled: settings.Auth.Enabled,
    },
  };
};
