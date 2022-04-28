import { get } from 'svelte/store';
import WebSocketAsPromised from 'websocket-as-promised';
import type Options from 'websocket-as-promised/types/options';
import {
  dataConverterPort,
  setLastDataConverterFailure,
} from '../stores/data-converter-config';

export interface DataConverterWebsocketInterface {
  hasWebsocket: boolean;
  websocket: WebSocketAsPromised;
  closeSocket: () => Promise<CloseEvent>;
}

export const createWebsocket = (
  port: string | null,
  extraParams?: Options,
): DataConverterWebsocketInterface => {
  if (!port) {
    return {
      hasWebsocket: false,
      websocket: null,
      closeSocket: function () {
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
    sock.onError.addListener((event) => {
      console.error(`Websocket connection error: ${event}`);
    });
  } catch (err) {
    setLastDataConverterFailure(`Error creating websocket: ${err}`);
  }

  sock.open();

  return {
    hasWebsocket: true,
    websocket: sock,
    closeSocket: function (): Promise<CloseEvent> {
      return sock.close();
    },
  };
};

let sock = null;
const port = get(dataConverterPort) ?? null;

export const dataConverterWebsocket = createWebsocket(port);
