import { get } from 'svelte/store';
import WebSocketAsPromised from 'websocket-as-promised';
import type Options from 'websocket-as-promised/types/options';
import {
  dataConverterPort,
  setLastDataConverterFailure,
} from '../stores/data-converter-config';
import type { RemoteDataConverterInterface } from './remote-data-converter';
import type { Payload } from '$types';

interface WebSocketResponse {
  content: string;
  requestId: string;
}

export const createWebsocket = (
  port: string | null,
  extraParams?: Options,
): RemoteDataConverterInterface => {
  if (!port) {
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

  try {
    sock = new WebSocketAsPromised(`ws://localhost:${port}/`, {
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data as string),
      attachRequestId: (data, requestId) =>
        Object.assign({ requestId: requestId }, data),
      extractRequestId: (data) => data && data.requestId,

      ...extraParams,
    });
    sock.onError(() => {
      console.log('oh snap');
    });
  } catch (err) {
    setLastDataConverterFailure();
  }

  sock.open();

  return {
    configured: true,
    isOpened: () => sock.isOpened,
    open: sock.open,
    sendRequest: (payload: Payload) => {
      return sock
        .sendRequest(JSON.stringify({ payload: payload }))
        .then((r: WebSocketResponse) => r.content);
    },
  };
};

let sock = null;
const port = get(dataConverterPort) ?? null;

export const dataConverterWebsocket = createWebsocket(port);
