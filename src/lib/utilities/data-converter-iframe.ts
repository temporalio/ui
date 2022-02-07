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

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const open: Promise<boolean> = new Promise((resolve) => {
    iframe.src = endpoint + '/js';
    // Note: the load event will always fire, it does not indicate success.
    // There is no way to detect cross-origin iframe load errors :(
    iframe.addEventListener('load', () => resolve(true));
  });

  let target: MessageEventSource;

  window.addEventListener('message', (event) => {
    if (event.origin != endpoint) {
      return;
    }

    switch (event.data.type) {
      case 'data_encoder_ready':
        target = event.source;
        break;
      case 'encoded':
      case 'decoded':
        requests[event.data.requestId](event.data.payload);
        delete requests[event.data.requestId];
        break;
    }
  });

  let requestId = 0;
  const requests = {};

  const nextRequestId = (): number => {
    return (requestId += 1);
  };

  return {
    configured: true,
    isOpened: () => !!target,
    open: () => open,
    decode: async (payload: Payload): Promise<Payload> => {
      const id = nextRequestId();
      return new Promise((resolve) => {
        requests[id] = resolve;
        target.postMessage(
          { requestId: id, type: 'decode', payload: payload },
          { targetOrigin: endpoint },
        );
      });
    },
  };
};

const endpoint = get(dataConverterEndpoint) ?? null;

export const dataConverterIframe = createIframe(endpoint);
