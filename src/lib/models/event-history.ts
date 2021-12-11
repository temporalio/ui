import { convertSinglePayloadDataConverter } from '$lib/services/data-converter';
import { dataConverterPort } from '$lib/stores/data-converter-config';
import { dataConverterWebsocket } from '$lib/stores/data-converter-websocket';
import type {
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
  Payload,
} from '$types';
import { get } from 'svelte/store';

export function getEventAttributes(historyEvent: HistoryEvent): EventAttribute {
  const attributeKey = Object.keys(historyEvent).find((key) =>
    key.includes('Attributes'),
  );
  const attributes = historyEvent[attributeKey];

  const port = get(dataConverterPort);
  const webSocket = dataConverterWebsocket.websocket;

  if (port) {
    const potentialPayload = (attributes?.input?.payloads ??
      attributes?.result?.payloads ??
      null) as Payload[] | null;

    if (potentialPayload) {
      attributes.payloadPromise = potentialPayload.map((payload) => {
        return convertSinglePayloadDataConverter(payload, webSocket);
      });

      // Verify the promise responds
      attributes.payloadPromise.map((promise) => {
        promise.then((stuff) => {
          console.log(stuff);
        });
      });
    }
  }

  return {
    type: attributeKey as EventAttributeKeys,
    ...attributes,
  };
}

export const toEventHistory = (
  response: GetWorkflowExecutionHistoryResponse,
): HistoryEventWithId[] => {
  return response.history.events.map((event) => ({
    ...event,
    id: String(event.eventId),
    attributes: getEventAttributes(event),
  }));
};
