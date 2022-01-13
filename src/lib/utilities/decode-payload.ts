import type { Payload } from '$types';
import { dataConverterPort } from '$lib/stores/data-converter-config';
import { dataConverterWebsocket } from '$lib/utilities/data-converter-websocket';
import { get } from 'svelte/store';
import { convertPayload } from '$lib/services/data-converter';
import { decodePayload } from './decode-payload-lazy';

export const convertPayloadToJson = async (
  eventAttribute: EventAttribute,
): Promise<EventAttribute> => {
  if (!eventAttribute) return eventAttribute;

  // This anyAttribues allows us to use ?. notation to introspect the object which is a safe access pattern.
  // Because of the way we wrote our discrimited union we have to use this any. If we have two objects that
  // don't have the same property TS won't let us access that object without verifying the type string like
  // attributes.type === "ATypeWithInput/Result"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = eventAttribute as any;

  const port = get(dataConverterPort);

  const potentialPayload = (anyAttributes?.input?.payloads ??
    anyAttributes?.result?.payloads ??
    null) as Payload[] | null;

  if (potentialPayload === null) {
    return Promise.resolve(eventAttribute);
  }

  let JSONPayload = potentialPayload.map(decodePayload);

  if (port) {
    const webSocket = dataConverterWebsocket.websocket;

    const awaitData = await Promise.all(
      potentialPayload.map(
        async (payload) => await convertPayload(payload, webSocket),
      ),
    );
    JSONPayload = awaitData;
  }

  if (anyAttributes?.input?.payloads) {
    anyAttributes.input.payloads = JSONPayload;
  }
  if (anyAttributes?.result?.payloads) {
    anyAttributes.result.payloads = JSONPayload;
  }

  // Decode Search Attributes
  if (anyAttributes?.searchAttributes?.indexedFields) {
    const searchAttributes = anyAttributes?.searchAttributes?.indexedFields;

    Object.entries(searchAttributes).forEach(([key, value]) => {
      searchAttributes[key] = decodePayload(value);
    });
  }

  // Decode Memo
  if (anyAttributes?.memo?.fields) {
    const memo = anyAttributes?.memo?.fields;

    Object.entries(memo).forEach(([key, value]) => {
      memo[key] = decodePayload(value);
    });
  }

  // Decode Header
  if (anyAttributes?.header?.fields) {
    const header = anyAttributes?.header?.fields;

    Object.entries(header).forEach(([key, value]) => {
      header[key] = decodePayload(value);
    });
  }

  // Decode Query Result
  // This one is a best guess from the previous codebase and needs verified
  if (anyAttributes?.queryResult) {
    const queryResult = anyAttributes?.queryResult;

    Object.entries(queryResult).forEach(([key, value]) => {
      queryResult[key] = decodePayload(value);
    });
  }

  return anyAttributes;
};
