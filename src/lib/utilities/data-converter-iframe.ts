import { get } from 'svelte/store';
import { dataConverterEndpoint } from '../stores/data-converter-config';
import type { Payload } from '$types';
import type { RemoteDataConverterInterface } from './remote-data-converter';

export const createIframe = (
  endpoint: string | null,
): RemoteDataConverterInterface => {
  if (!endpoint) {
    return {
      configured: false,
      isOpened: () => false,
      open: () => {
        return null;
      },
      decode: (payload: Payload): Promise<Payload> => {
        return Promise.resolve(payload);
      },
    };
  }

  return {
    configured: true,
    isOpened: () => true,
    open: () => Promise.resolve(true),
    decode: async (payload: Payload): Promise<Payload> => {
      let response = await fetch(endpoint + '/decode', { method: 'POST', body: JSON.stringify(payload) })
      return response.json()
    },
  };
};

const endpoint = get(dataConverterEndpoint) ?? null;

export const dataConverterIframe = createIframe(endpoint);
