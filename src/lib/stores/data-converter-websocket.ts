import { get } from 'svelte/store';
import WebSocketAsPromised from 'websocket-as-promised';
import {
  dataConverterPort,
  setLastDataConverterFailure,
} from './data-converter-config';

export const dataConverterWebsocket = (function () {
  let sock = null;
  const port = get(dataConverterPort) ?? null;

  if (port == null) {
    return {
      websocket: function () {
        return null;
      },
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
    });
    console.log('Websocket Created');
  } catch (err) {
    setLastDataConverterFailure();
  }

  sock.open();

  return {
    websocket: sock,
    closeSocket: function () {
      sock.close();
    },
  };
})();
