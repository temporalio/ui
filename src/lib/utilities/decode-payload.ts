import type { Payload } from '$types';

import { dataConverterWebsocket } from '$lib/utilities/data-converter-websocket';
import type { DataConverterWebsocketInterface } from '$lib/utilities/data-converter-websocket';

import { convertPayloadWithWebsocket } from '$lib/services/data-converter';
import { convertPayloadsWithCodec } from '$lib/services/data-encoder';
import { get } from 'svelte/store';
import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';

import { atob } from './atob';

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

export const convertPayloadToJsonWithCodec = async (
  eventAttribute: EventAttribute,
): Promise<EventAttribute> => {
  // This anyAttribues allows us to use ?. notation to introspect the object which is a safe access pattern.
  // Because of the way we wrote our discrimited union we have to use this any. If we have two objects that
  // don't have the same property TS won't let us access that object without verifying the type string like
  // attributes.type === "ATypeWithInput/Result"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = eventAttribute as any;
  const potentialPayload = (anyAttributes?.input?.payloads ??
    anyAttributes?.result?.payloads ??
    null) as Payload[] | null;

  if (potentialPayload) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let JSONPayload: string | Payload | Record<any, any>;

    const remoteEncoderEndpoint = get(dataEncoderEndpoint);
    if (remoteEncoderEndpoint) {
      // Convert Payload data

      const awaitData = await convertPayloadsWithCodec(
        { payloads: potentialPayload },
        remoteEncoderEndpoint,
      );
      JSONPayload = (awaitData?.payloads ?? []).map(decodePayload);
    } else {
      JSONPayload = potentialPayload.map(decodePayload);
    }

    if (anyAttributes?.input?.payloads) {
      anyAttributes.input.payloads = JSONPayload;
    }
    if (anyAttributes?.result?.payloads) {
      anyAttributes.result.payloads = JSONPayload;
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
  const potentialPayload = (anyAttributes?.input?.payloads ??
    anyAttributes?.result?.payloads ??
    null) as Payload[] | null;

  if (potentialPayload) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let JSONPayload: string | Payload | Record<any, any>;

    const ws = websocket ?? dataConverterWebsocket;

    if (ws?.hasWebsocket) {
      // Convert Payload data
      const awaitData = await Promise.all(
        (potentialPayload ?? []).map(
          async (payload) =>
            await convertPayloadWithWebsocket(payload, ws.websocket),
        ),
      );

      JSONPayload = awaitData;
    } else {
      JSONPayload = potentialPayload.map(decodePayload);
    }

    if (anyAttributes?.input?.payloads) {
      anyAttributes.input.payloads = JSONPayload;
    }
    if (anyAttributes?.result?.payloads) {
      anyAttributes.result.payloads = JSONPayload;
    }
  }

  return anyAttributes;
};
