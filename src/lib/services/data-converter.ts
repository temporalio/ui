import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';
import type { Payload } from '$types';
import type WebSocketAsPromised from 'websocket-as-promised';

interface WebSocketResponse {
  content: string;
  requestId: string;
}

export async function convertPayloadWithWebsocket(
  payload: Payload,
  websocket: WebSocketAsPromised,
): Promise<string | Payload> {
  if (!websocket.isOpened) {
    try {
      await websocket.open();
    } catch (_e) {}
  }

  if (!websocket.isOpened) {
    return Promise.resolve(payload);
  }

  const socketResponse: Promise<string> = websocket
    .sendRequest({
      payload: stringifyWithBigInt(payload),
    })
    .then((response: WebSocketResponse) => {
      try {
        const decodedResponse = parseWithBigInt(response.content);
        return decodedResponse;
      } catch {
        // This doesn't seem to be a failure the worker _could_ send back a text response
        // instead of JSON
        return response.content;
      }
    })
    .catch((error) => {});

  return socketResponse;
}
