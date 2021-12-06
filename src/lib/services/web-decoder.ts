import type { HistoryEventWithId } from '$lib/models/event-history';
import {
  setLastWebDecoderFailure,
  setLastWebDecoderSuccess,
} from '$lib/stores/web-decoder-config';
import type { Payload } from '$types';

import WebSocketAsPromised from 'websocket-as-promised';

export const webDecodeEventPayloads = async (
  events: any[],
  port: string | null,
) => {
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
    setLastWebDecoderFailure();
    return Promise.reject(err);
  }

  try {
    await sock.open();
    console.log('opened', sock);
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

      console.log({ payloads });

      payloads.forEach((payload, i) => {
        requests.push(
          sock
            .sendRequest({ payload: JSON.stringify(payload) })
            .then((response) => {
              let currentPayload = null;
              try {
                currentPayload = JSON.parse(response.content);
                setLastWebDecoderSuccess();
              } catch {
                // This doesn't seem to be a failure the worker _could_ send back a text response
                currentPayload = response.content;
                setLastWebDecoderFailure();
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
  } catch (err) {
    console.log(err);
    const message = `Unable to convert event payload: ${err}`;
    setLastWebDecoderFailure();
    return Promise.reject({ message });
  } finally {
    if (sock.isOpened) {
      await sock.close();
    }
  }

  return events;
};
