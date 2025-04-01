import Client from 'temporal-http-client';

import { getApiOrigin } from './get-api-origin';

export const newClient = (apiUrl?: string) => {
  if (!apiUrl) {
    apiUrl = getApiOrigin();
  }

  return new Client(apiUrl);
};

export const temporalDefaultClient = newClient();
