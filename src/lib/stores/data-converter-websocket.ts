import { get } from 'svelte/store';
import WebSocketAsPromised from 'websocket-as-promised';
import {
  dataConverterPort,
  setLastDataConverterFailure,
} from './data-converter-config';

let sock = null;
const port = get(dataConverterPort) ?? null;

try {
  sock = new WebSocketAsPromised(`ws://localhost:${port}/`, {
    packMessage: (data) => JSON.stringify(data),
    unpackMessage: (data) => JSON.parse(data as string),
    attachRequestId: (data, requestId) =>
      Object.assign({ requestId: requestId }, data),
    extractRequestId: (data) => data && data.requestId,
  });
} catch (err) {
  setLastDataConverterFailure();
}

sock.open();

const configuredWebsocket = {
  websocket: sock,
  closeSocket: function (): void {
    sock.close();
  },
};

const unConfiguredWebsocket = {
  websocket: function () {
    return null;
  },
  closeSocket: function () {
    return null;
  },
};

export const dataConverterWebsocket =
  port !== null ? configuredWebsocket : unConfiguredWebsocket;
