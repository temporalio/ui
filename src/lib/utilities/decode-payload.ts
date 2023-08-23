import { convertPayloadWithWebsocket } from '$lib/services/data-converter';
import { convertPayloadsWithCodec } from '$lib/services/data-encoder';
import type {
  codecEndpoint,
  includeCredentials,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import type {
  EventAttribute,
  EventRequestMetadata,
  Payload,
} from '$lib/types/events';
import type { Optional, Replace, Settings } from '$lib/types/global';
import type { DataConverterWebsocketInterface } from '$lib/utilities/data-converter-websocket';
import { dataConverterWebsocket } from '$lib/utilities/data-converter-websocket';

import { atob } from './atob';
import { has } from './has';
import { isObject } from './is';
import { parseWithBigInt } from './parse-with-big-int';

type PotentiallyDecodable =
  | Record<string | number | symbol, unknown>
  | EventAttribute;

export type Decode = {
  convertPayloadToJsonWithCodec: typeof convertPayloadToJsonWithCodec;
  convertPayloadToJsonWithWebsocket: typeof convertPayloadToJsonWithWebsocket;
  decodePayloadAttributes: typeof decodePayloadAttributes;
};

export type DecodeFunctions = {
  convertWithCodec?: Decode['convertPayloadToJsonWithCodec'];
  convertWithWebsocket?: Decode['convertPayloadToJsonWithWebsocket'];
  decodeAttributes?: Decode['decodePayloadAttributes'];
  encoderEndpoint?: typeof codecEndpoint;
  codecPassAccessToken?: typeof passAccessToken;
  codecIncludeCredentials?: typeof includeCredentials;
};

const toArray = (payloads: Payload | Payload[]): Payload[] => {
  if (Array.isArray(payloads)) {
    return payloads;
  } else {
    return [payloads];
  }
};

export function decodePayload(
  payload: Payload,
  // This could decode to any object. So we either use the payload object passed in or decode it
): Payload {
  if (payload === null) {
    return payload;
  }

  const encoding = atob(String(payload?.metadata?.encoding ?? ''));

  // Help users out with an english encoding
  if (payload?.metadata) {
    (payload.metadata.encodingDecoded as unknown as string) = encoding;
  }

  if (encoding?.startsWith('json/')) {
    try {
      return parseWithBigInt(atob(String(payload?.data ?? '')));
    } catch (_e) {
      console.warn('Could not parse payload: ', _e);
      // Couldn't correctly decode this just let the user deal with the data as is
    }
  }

  if (encoding === 'binary/null') {
    return null;
  }

  return payload;
}

export const decodePayloadAttributes = <
  T extends Optional<PotentiallyDecodable>,
>(
  eventAttribute: T,
): Replace<T, Optional<PotentiallyDecodable>> => {
  // Decode Search Attributes
  if (
    has(eventAttribute, 'searchAttributes') &&
    has(eventAttribute.searchAttributes, 'indexedFields')
  ) {
    const searchAttributes = eventAttribute.searchAttributes.indexedFields;

    Object.entries(searchAttributes).forEach(([key, value]) => {
      searchAttributes[key] = decodePayload(value);
    });
  }

  // Decode Memo
  if (has(eventAttribute, 'memo') && has(eventAttribute.memo, 'fields')) {
    const memo = eventAttribute.memo.fields;

    Object.entries(memo).forEach(([key, value]) => {
      memo[key] = decodePayload(value);
    });
  }

  // Decode Header
  if (has(eventAttribute, 'header') && has(eventAttribute.header, 'fields')) {
    const header = eventAttribute.header.fields;

    Object.entries(header).forEach(([key, value]) => {
      header[key] = decodePayload(value);
    });
  }

  // Decode Query Result
  // This one is a best guess from the previous codebase and needs verified
  if (has(eventAttribute, 'queryResult')) {
    const queryResult = eventAttribute?.queryResult;

    Object.entries(queryResult).forEach(([key, value]) => {
      queryResult[key] = decodePayload(value);
    });
  }

  return eventAttribute;
};

const decodePayloadWithCodec =
  (namespace: string, settings: Settings, accessToken: string) =>
  async (payloads: unknown[]): Promise<unknown[]> => {
    if (settings?.codec?.endpoint) {
      // Convert Payload data
      const awaitData = await convertPayloadsWithCodec({
        payloads: { payloads },
        namespace,
        settings,
        accessToken,
      });
      return (awaitData?.payloads ?? []).map(decodePayload);
    } else {
      return payloads.map(decodePayload);
    }
  };

const keyIs = (key: string, ...validKeys: string[]) => {
  for (const validKey of validKeys) {
    if (key === validKey) return true;
  }
  return false;
};

export const decodeAllPotentialPayloadsWithCodec = async (
  anyAttributes: PotentiallyDecodable,
  namespace: string,
  settings: Settings,
  accessToken: string,
): Promise<PotentiallyDecodable> => {
  const decode = decodePayloadWithCodec(namespace, settings, accessToken);
  if (anyAttributes) {
    for (const key of Object.keys(anyAttributes)) {
      if (keyIs(key, 'payloads', 'encodedAttributes') && anyAttributes[key]) {
        const data = toArray(anyAttributes[key]);
        const decoded = await decode(data);
        anyAttributes[key] = keyIs(key, 'encodedAttributes')
          ? decoded[0]
          : decoded;
      } else {
        const next = anyAttributes[key];
        if (isObject(next)) {
          anyAttributes[key] = await decodeAllPotentialPayloadsWithCodec(
            next,
            namespace,
            settings,
            accessToken,
          );
        }
      }
    }
  }

  return anyAttributes;
};

export const decodeAllPotentialPayloadsWithWebsockets = async (
  anyAttributes: PotentiallyDecodable,
  ws: DataConverterWebsocketInterface,
): Promise<PotentiallyDecodable> => {
  if (anyAttributes) {
    for (const key of Object.keys(anyAttributes)) {
      if (key === 'payloads') {
        let JSONPayload: Payload[];
        const payloads = toArray(anyAttributes[key]);

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
      } else if (key === 'encodedAttributes' && anyAttributes[key]) {
        // Can expand if more fields have single payload

        let JSONPayload: PotentiallyDecodable;
        const payload = anyAttributes[key];
        if (ws?.hasWebsocket) {
          // Convert Payload data
          const awaitData = await convertPayloadWithWebsocket(
            payload,
            ws.websocket,
          );
          JSONPayload = awaitData;
        } else {
          JSONPayload = decodePayload(payload);
        }
        anyAttributes[key] = JSONPayload;
      } else {
        const next = anyAttributes[key];
        if (isObject(next)) {
          anyAttributes[key] = await decodeAllPotentialPayloadsWithWebsockets(
            next,
            ws,
          );
        }
      }
    }
  }

  return anyAttributes;
};

export const convertPayloadToJsonWithCodec = async ({
  attributes,
  namespace,
  settings,
  accessToken,
}: {
  attributes: PotentiallyDecodable;
} & EventRequestMetadata): Promise<PotentiallyDecodable> => {
  const decodedAttributes = await decodeAllPotentialPayloadsWithCodec(
    attributes,
    namespace,
    settings,
    accessToken,
  );
  return decodedAttributes;
};

export const convertPayloadToJsonWithWebsocket = async (
  attributes: PotentiallyDecodable,
  websocket?: DataConverterWebsocketInterface,
): Promise<PotentiallyDecodable> => {
  const ws = websocket ?? dataConverterWebsocket;
  const decodedAttributes = await decodeAllPotentialPayloadsWithWebsockets(
    attributes,
    ws,
  );
  return decodedAttributes;
};
