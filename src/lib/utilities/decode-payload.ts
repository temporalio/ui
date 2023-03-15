import type { Payload } from '$types';

import { dataConverterWebsocket } from '$lib/utilities/data-converter-websocket';
import type { DataConverterWebsocketInterface } from '$lib/utilities/data-converter-websocket';

import { convertPayloadWithWebsocket } from '$lib/services/data-converter';
import { convertPayloadsWithCodec } from '$lib/services/data-encoder';

import type {
  codecEndpoint,
  passAccessToken,
} from '$lib/stores/data-encoder-config';

import { atob } from './atob';
import { parseWithBigInt } from './parse-with-big-int';

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
};

export function decodePayload(
  payload: Payload,
  // This could decode to any object. So we either use the payload object passed in or decode it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): DecodedPayload {
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

  return payload;
}

export const decodePayloadAttributes = <T extends Optional<Decodable>>(
  encoded: T,
): Replace<T, Optional<Decoded>> => {
  const decoded: Optional<Decoded> = {};
  // Decode Search Attributes
  if (encoded?.searchAttributes?.indexedFields) {
    const searchAttributes = encoded?.searchAttributes?.indexedFields ?? {};
    decoded.searchAttributes = { indexedFields: {} };

    Object.entries(searchAttributes).forEach(([key, value]) => {
      decoded.searchAttributes.indexedFields[key] = decodePayload(value);
    });
  }

  // Decode Memo
  if (encoded?.memo?.fields) {
    const memo = encoded?.memo?.fields;
    decoded.memo = { fields: {} };

    Object.entries(memo).forEach(([key, value]) => {
      decoded.memo.fields[key] = decodePayload(value);
    });
  }

  // Decode Header
  if (encoded?.header?.fields) {
    const header = encoded?.header?.fields;
    decoded.header = { fields: {} };

    Object.entries(header).forEach(([key, value]) => {
      decoded.header.fields[key] = decodePayload(value);
    });
  }

  // Decode Query Result
  // This one is a best guess from the previous codebase and needs verified
  if (encoded?.queryResult) {
    const payloads = encoded?.queryResult.answer.payloads;
    decoded.queryResult = { answer: [] };
    payloads.forEach((payload) => {
      decoded.queryResult.answer.push(decodePayload(payload));
    });
  }

  return {
    ...encoded,
    ...decoded,
  };
};

export const decodeAllPotentialPayloadsWithCodec = async (
  anyAttributes: any,
  namespace: string,
  settings: Settings,
  accessToken: string,
): Promise<any> => {
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
            accessToken,
          });
          JSONPayload = (awaitData?.payloads ?? []).map(decodePayload);
        } else {
          JSONPayload = payloads.map(decodePayload);
        }
        anyAttributes[key] = JSONPayload;
      } else if (key === 'encodedAttributes' && anyAttributes[key]) {
        // Can expand if more fields have single payload
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let JSONPayload: string | Payload | Record<any, any>;
        const payload = anyAttributes[key];
        if (settings?.codec?.endpoint) {
          // Convert Payload data
          const awaitData = await convertPayloadsWithCodec({
            payloads: { payloads: [payload] },
            namespace,
            settings,
            accessToken,
          });
          JSONPayload = decodePayload(awaitData?.payloads[0]);
        } else {
          JSONPayload = decodePayload(payload);
        }
        anyAttributes[key] = JSONPayload;
      } else if (typeof anyAttributes[key] === 'object') {
        anyAttributes[key] = await decodeAllPotentialPayloadsWithCodec(
          anyAttributes[key],
          namespace,
          settings,
          accessToken,
        );
      }
    }
  }

  return anyAttributes;
};

export const decodeAllPotentialPayloadsWithWebsockets = async (
  anyAttributes: any,
  ws: DataConverterWebsocketInterface,
): Promise<any> => {
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
      } else if (key === 'encodedAttributes' && anyAttributes[key]) {
        // Can expand if more fields have single payload
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let JSONPayload: string | Payload | Record<any, any>;
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
  accessToken,
}: {
  attributes: any;
} & EventRequestMetadata): Promise<any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = attributes as any;
  const decodedAttributes = await decodeAllPotentialPayloadsWithCodec(
    anyAttributes,
    namespace,
    settings,
    accessToken,
  );
  return decodedAttributes;
};

export const convertPayloadToJsonWithWebsocket = async (
  attributes: any,
  websocket?: DataConverterWebsocketInterface,
): Promise<any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = attributes as any;
  const ws = websocket ?? dataConverterWebsocket;
  const decodedAttributes = await decodeAllPotentialPayloadsWithWebsockets(
    anyAttributes,
    ws,
  );
  return decodedAttributes;
};
