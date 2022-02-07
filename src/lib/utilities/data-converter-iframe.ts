import { get } from 'svelte/store';
import {
  dataConverterEndpoint,
  setLastDataConverterFailure,
} from '../stores/data-converter-config';
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
      sendRequest: () => {
        return null;
      },
    };
  }

  let iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  let open: Promise<boolean> = new Promise((resolve) => {
    iframe.src = endpoint + '/js';
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
  let requests = {};

  const nextRequestId = (): number => {
    return (requestId += 1);
  };

  return {
    configured: true,
    isOpened: () => !!target,
    open: () => open,
    sendRequest: async (data: any) => {
      let id = nextRequestId();
      return new Promise((resolve) => {
        requests[id] = resolve;
        target.postMessage(
          { requestId: id, type: 'decode', payload: data.payload },
          { targetOrigin: endpoint },
        );
      });
    },
  };
};

const endpoint = get(dataConverterEndpoint) ?? null;

export const dataConverterIframe = createIframe(endpoint);
