import { get } from 'svelte/store';

import WebSocketAsPromised from 'websocket-as-promised';
import type Options from 'websocket-as-promised/types/options';

import { parseWithBigInt, stringifyWithBigInt } from './parse-with-big-int';
import {
  dataConverterPort,
  setLastDataConverterFailure,
} from '../stores/data-converter-config';

export interface DataConverterWebsocketInterface {
  hasWebsocket: boolean;
  websocket: WebSocketAsPromised | null;
  closeSocket: () => Promise<CloseEvent> | null;
}

let sock: WebSocketAsPromised | null = null;
const port = get(dataConverterPort) ?? null;

export const createWebsocket = (
  port: string | null,
  extraParams?: Options,
): DataConverterWebsocketInterface => {
  if (!port) {
    return {
      hasWebsocket: false,
      websocket: null,
      closeSocket: () => null,
    };
  }

  try {
    sock = new WebSocketAsPromised(`ws://localhost:${port}/`, {
      packMessage: (data) => stringifyWithBigInt(data),
      unpackMessage: (data) => parseWithBigInt(data as string),
      attachRequestId: (data, requestId) =>
        Object.assign({ requestId: requestId }, data),
      extractRequestId: (data) => data && data.requestId,

      ...extraParams,
    });
    sock.onError.addListener((event: unknown) => {
      console.error(`Websocket connection error: ${event}`);
    });
  } catch (err) {
    setLastDataConverterFailure(`Error creating websocket: ${err}`);
  }

  sock?.open();

  return {
    hasWebsocket: true,
    websocket: sock,
    closeSocket: () => {
      if (!sock) return null;
      return sock.close();
    },
  };
};

export const dataConverterWebsocket = createWebsocket(port);
