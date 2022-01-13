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

// This can be baleeted!
export const convertEventPayloadFromDataConverter = async (
  events: HistoryEventWithId[],
  port: string | null,
): Promise<HistoryEventWithId[]> => {
  let sock = null;

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
    return Promise.reject(err);
  }

  try {
    await sock.open();
    const requests = [];

    events.forEach((event: HistoryEventWithId) => {
      let payloads: Payload[] = [];

      // Probably want to elaborate on the types for this;
      switch (event.attributes.type) {
        case 'activityTaskCompletedEventAttributes':
          payloads = event.attributes.result.payloads;
          break;
        case 'signalExternalWorkflowExecutionInitiatedEventAttributes':
        case 'workflowExecutionStartedEventAttributes':
        case 'activityTaskScheduledEventAttributes':
          payloads = event.attributes.input.payloads;
          break;
      }

      payloads.forEach((payload) => {
        requests.push(
          sock
            .sendRequest({ payload: JSON.stringify(payload) })
            .then((response: WebSocketResponse) => {
              let currentPayload = null;
              try {
                currentPayload = JSON.parse(response.content);
                setLastDataConverterSuccess();
              } catch {
                // This doesn't seem to be a failure the worker _could_ send back a text response
                // instead of JSON
                currentPayload = response.content;
              }
              switch (event.attributes.type) {
                case 'activityTaskCompletedEventAttributes':
                  event.attributes.result.payloads = currentPayload;
                  break;
                case 'signalExternalWorkflowExecutionInitiatedEventAttributes':
                case 'workflowExecutionStartedEventAttributes':
                case 'activityTaskScheduledEventAttributes':
                  event.attributes.input.payloads = currentPayload;
                  break;
              }
            }),
        );
      });
    });
    await Promise.all(requests);
    return Promise.resolve(events);
  } catch (err) {
    const message = `Unable to convert event payload: ${err}`;
    setLastDataConverterFailure();
    return Promise.reject({ message });
  } finally {
    if (sock.isOpened) {
      await sock.close();
    }
  }
};
