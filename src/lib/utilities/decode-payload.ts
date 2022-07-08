import type { Payload } from '$types';

import { dataConverterWebsocket } from '$lib/utilities/data-converter-websocket';
import type { DataConverterWebsocketInterface } from '$lib/utilities/data-converter-websocket';

import { convertPayloadWithWebsocket } from '$lib/services/data-converter';
import { convertPayloadsWithCodec } from '$lib/services/data-encoder';

import { atob } from './atob';

export type Decode = {
  convertPayloadToJsonWithCodec: typeof convertPayloadToJsonWithCodec;
  convertPayloadToJsonWithWebsocket: typeof convertPayloadToJsonWithWebsocket;
  decodePayloadAttributes: typeof decodePayloadAttributes;
};

export function decodePayload(
  payload: Payload,
  // This could decode to any object. So we either use the payload object passed in or decode it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Payload | Record<any, any> | string {
  const encoding = atob(String(payload?.metadata?.encoding ?? ''));
  // Help users out with an english encoding
  (payload.metadata.encodingDecoded as unknown as string) = encoding;

  switch (encoding) {
    case 'json/plain':
    case 'json/protobuf':
      try {
        return JSON.parse(atob(String(payload.data)));
      } catch (_e) {
        // Couldn't correctly decode this just let the user deal with the data as is
      }
  }

  return payload;
}

export const decodePayloadAttributes = (
  eventAttribute: EventAttribute,
): EventAttribute => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = eventAttribute as any;

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

// List of fields with payloads
const payloadFields: string[][] = [
  ['data'],
  ['input'],
  ['result'],
  ['details', 'change-id'],
  ['details', 'data'],
  ['details', 'result'],
  ['details', 'version'],
  ['details'],
  ['heartbeatDetails'],
  ['lastHeartbeatDetails'],
  ['lastFailure'],
  ['lastCompletionResult'],
  ['queryArgs'],
  ['answer'],
  ['signalInput'],
];

const get = (fields, object) =>
  fields.reduce(
    (nestedObject, field) =>
      nestedObject && nestedObject?.[field] ? nestedObject[field] : null,
    object,
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPotentialPayloads = (anyAttributes: any): Payload[] | null => {
  let payloads = null;
  for (const field of payloadFields) {
    const value = get(field, anyAttributes);
    if (value) {
      payloads = value?.payloads;
      break;
    }
  }

  return payloads;
};

export const convertPayloadToJsonWithCodec = async ({
  attributes,
  namespace,
  settings,
}: {
  attributes: EventAttribute;
} & EventRequestMetadata): Promise<EventAttribute> => {
  // This anyAttribues allows us to use ?. notation to introspect the object which is a safe access pattern.
  // Because of the way we wrote our discrimited union we have to use this any. If we have two objects that
  // don't have the same property TS won't let us access that object without verifying the type string like
  // attributes.type === "ATypeWithInput/Result"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = attributes as any;

  const potentialPayloads = getPotentialPayloads(anyAttributes);

  if (potentialPayloads) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let JSONPayload: string | Payload | Record<any, any>;

    const endpoint = settings?.codec?.endpoint;
    if (endpoint) {
      // Convert Payload data
      const awaitData = await convertPayloadsWithCodec({
        payloads: { payloads: potentialPayloads },
        namespace,
        settings,
      });
      JSONPayload = (awaitData?.payloads ?? []).map(decodePayload);
    } else {
      JSONPayload = potentialPayloads.map(decodePayload);
    }

    for (const field of payloadFields) {
      const value = get(field, anyAttributes);
      if (value?.payloads) {
        value.payloads = JSONPayload;
      }
    }
  }

  return anyAttributes;
};

export const convertPayloadToJsonWithWebsocket = async (
  eventAttribute: EventAttribute,
  websocket?: DataConverterWebsocketInterface,
): Promise<EventAttribute> => {
  // This anyAttribues allows us to use ?. notation to introspect the object which is a safe access pattern.
  // Because of the way we wrote our discrimited union we have to use this any. If we have two objects that
  // don't have the same property TS won't let us access that object without verifying the type string like
  // attributes.type === "ATypeWithInput/Result"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = eventAttribute as any;
  const potentialPayloads = getPotentialPayloads(anyAttributes);

  if (potentialPayloads) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let JSONPayload: string | Payload | Record<any, any>;

    const ws = websocket ?? dataConverterWebsocket;

    if (ws?.hasWebsocket) {
      // Convert Payload data
      const awaitData = await Promise.all(
        (potentialPayloads ?? []).map(
          async (payload) =>
            await convertPayloadWithWebsocket(payload, ws.websocket),
        ),
      );

      JSONPayload = awaitData;
    } else {
      JSONPayload = potentialPayloads.map(decodePayload);
    }

    for (const field of payloadFields) {
      const value = get(field, anyAttributes);
      if (value?.payloads) {
        value.payloads = JSONPayload;
      }
    }
  }

  return anyAttributes;
};
