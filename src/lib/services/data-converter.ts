import type WebSocketAsPromised from 'websocket-as-promised';

import {
  setLastDataConverterFailure,
  setLastDataConverterSuccess,
} from '$lib/stores/data-converter-config';
import type { Payload } from '$lib/types/events';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

interface WebSocketResponse {
  content: string;
  requestId: string;
}

export async function convertPayloadWithWebsocket(
  payload: Payload,
  websocket: WebSocketAsPromised | null,
): Promise<Payload> {
  if (!websocket) return payload;

  if (!websocket.isOpened) {
    try {
      await websocket.open();
    } catch (_e) {
      setLastDataConverterFailure(`Error opening websocket: ${_e}`);
    }
  }

  if (!websocket.isOpened) {
    return Promise.resolve(payload);
  }

  const socketResponse = websocket
    .sendRequest({
      payload: stringifyWithBigInt(payload),
    })
    .then((response: WebSocketResponse) => {
      setLastDataConverterSuccess();

      try {
        const decodedResponse = parseWithBigInt(response.content);
        return decodedResponse;
      } catch {
        // This doesn't seem to be a failure the worker _could_ send back a text response
        // instead of JSON
        return response.content;
      }
    })
    .catch((error) => {
      setLastDataConverterFailure(
        `Error decoding websocket response: ${error}`,
      );
    });

  return socketResponse;
}
