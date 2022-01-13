import {
  setLastDataConverterFailure,
  setLastDataConverterSuccess,
} from '$lib/stores/data-converter-config';
import type { Payload } from '$types';

import WebSocketAsPromised from 'websocket-as-promised';

interface WebSocketResponse {
  content: string;
  requestId: string;
}

export async function convertSinglePayloadDataConverter(
  payload: Payload,
  websocket: any,
): Promise<string> {
  if (!websocket.isOpened && !websocket.isOpening) {
    await websocket.open();
  }

  const socketResponse: Promise<string> = websocket
    .sendRequest({
      payload: JSON.stringify(payload),
    })
    .then((response) => {
      try {
        const decodedResponse = JSON.parse(response.content);
        setLastDataConverterSuccess();
        return decodedResponse;
      } catch {
        // This doesn't seem to be a failure the worker _could_ send back a text response
        // instead of JSON
        return response.content;
      }
    });

  return socketResponse;
}
