import type { Payload } from '$types';

import { dataConverterWebsocket } from '$lib/utilities/data-converter-websocket';
import type { DataConverterWebsocketInterface } from '$lib/utilities/data-converter-websocket';

import { convertPayloadWithWebsocket } from '$lib/services/data-converter';
import { convertPayloadsWithCodec } from '$lib/services/data-encoder';

import type { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';

import { atob } from './atob';

export type Decode = {
  convertPayloadToJsonWithCodec: typeof convertPayloadToJsonWithCodec;
  convertPayloadToJsonWithWebsocket: typeof convertPayloadToJsonWithWebsocket;
  decodePayloadAttributes: typeof decodePayloadAttributes;
};

export type DecodeFunctions = {
  convertWithCodec?: Decode['convertPayloadToJsonWithCodec'];
  convertWithWebsocket?: Decode['convertPayloadToJsonWithWebsocket'];
  decodeAttributes?: Decode['decodePayloadAttributes'];
  encoderEndpoint?: typeof dataEncoderEndpoint;
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

export const decodeAllPotentialPayloadsWithCodec = async (
  anyAttributes: any,
  namespace: string,
  settings: Settings,
): Promise<EventAttribute> => {
  if (anyAttributes) {
    for (const key of Object.keys(anyAttributes)) {
      if (key === 'payloads') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let JSONPayload: string | Payload | Record<any, any>;
        const payloads = anyAttributes[key];
        if (settings?.codec?.endpoint) {
          // Convert Payload data
          const awaitData = await convertPayloadsWithCodec({
            payloads: { payloads },
            namespace,
            settings,
          });
          JSONPayload = (awaitData?.payloads ?? []).map(decodePayload);
        } else {
          JSONPayload = payloads.map(decodePayload);
        }
        anyAttributes[key] = JSONPayload;
      } else if (typeof anyAttributes[key] === 'object') {
        anyAttributes[key] = await decodeAllPotentialPayloadsWithCodec(
          anyAttributes[key],
          namespace,
          settings,
        );
      }
    }
  }

  return anyAttributes;
};

export const decodeAllPotentialPayloadsWithWebsockets = async (
  anyAttributes: any,
  ws: DataConverterWebsocketInterface,
): Promise<EventAttribute> => {
  if (anyAttributes) {
    for (const key of Object.keys(anyAttributes)) {
      if (key === 'payloads') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let JSONPayload: string | Payload | Record<any, any>;
        const payloads = anyAttributes[key];
        if (ws?.hasWebsocket) {
          // Convert Payload data
          const awaitData = await Promise.all(
            (payloads ?? []).map(
              async (payload) =>
                await convertPayloadWithWebsocket(payload, ws.websocket),
            ),
          );
          JSONPayload = awaitData;
        } else {
          JSONPayload = payloads.map(decodePayload);
        }
        anyAttributes[key] = JSONPayload;
      } else if (typeof anyAttributes[key] === 'object') {
        anyAttributes[key] = await decodeAllPotentialPayloadsWithWebsockets(
          anyAttributes[key],
          ws,
        );
      }
    }
  }

  return anyAttributes;
};

export const convertPayloadToJsonWithCodec = async ({
  attributes,
  namespace,
  settings,
}: {
  attributes: EventAttribute;
} & EventRequestMetadata): Promise<EventAttribute> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = attributes as any;
  const decodedAttributes = await decodeAllPotentialPayloadsWithCodec(
    anyAttributes,
    namespace,
    settings,
  );
  return decodedAttributes;
};

export const convertPayloadToJsonWithWebsocket = async (
  attributes: EventAttribute,
  websocket?: DataConverterWebsocketInterface,
): Promise<EventAttribute> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = attributes as any;
  const ws = websocket ?? dataConverterWebsocket;
  const decodedAttributes = await decodeAllPotentialPayloadsWithWebsockets(
    anyAttributes,
    ws,
  );
  return decodedAttributes;
};
