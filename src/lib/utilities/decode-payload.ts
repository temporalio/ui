import { decodePayloadsWithCodec as callCodecEndpoint } from '$lib/services/data-encoder';
import type { DownloadEventHistorySetting } from '$lib/stores/events';
import type { Memo, Payloads, Payload as RawPayload } from '$lib/types';
import type { EventAttribute, Payload, WorkflowEvent } from '$lib/types/events';
import type { Optional, Replace } from '$lib/types/global';

import { atob } from './atob';
import { has } from './has';
import { isObject } from './is';
import { parseWithBigInt } from './parse-with-big-int';

export type PotentiallyDecodable =
  | Payloads
  | Record<string | number | symbol, unknown>;

export type DecodeFunctions = {
  convertWithCodec?: typeof decodeEventAttributes;
  decodeAttributes?: typeof decodePayloadAttributes;
};

const toArray = (payloads: Payload | Payload[]): Payload[] => {
  if (Array.isArray(payloads)) {
    return payloads;
  } else {
    return [payloads];
  }
};

const decodeMetadata = (metadata: Record<string, unknown>) => {
  return Object.entries(metadata).reduce(
    (acc, [key, value]) => {
      acc[key] = atob(String(value));
      return acc;
    },
    {} as Record<string, string>,
  );
};

export function decodeRawPayload(
  payload: Payload,
  returnDataOnly: boolean = true,
  // This could decode to any object. So we either use the payload object passed in or decode it
): unknown | Payload | null {
  if (payload === null) {
    return payload;
  }

  try {
    const data = parseWithBigInt(atob(String(payload?.data ?? '')));
    if (returnDataOnly) return data;
    const metadata = decodeMetadata(payload?.metadata);
    return {
      metadata,
      data,
    };
  } catch (_e) {
    console.warn('Could not parse payload: ', _e);
    // Couldn't correctly decode this just let the user deal with the data as is
  }

  const encoding = atob(String(payload?.metadata?.encoding ?? ''));
  if (encoding === 'binary/null') {
    if (returnDataOnly) return null;
    const metadata = decodeMetadata(payload?.metadata);
    return {
      metadata,
      data: null,
    };
  }

  return payload;
}

export const decodePayloadAttributes = <
  T extends Optional<PotentiallyDecodable | EventAttribute | WorkflowEvent>,
>(
  eventAttribute: T,
  returnDataOnly: boolean = true,
): Replace<
  T,
  Optional<PotentiallyDecodable | EventAttribute | WorkflowEvent>
> => {
  // Decode Search Attributes
  if (has(eventAttribute, 'searchAttributes')) {
    const searchAttributes = has(
      eventAttribute.searchAttributes,
      'indexedFields',
    )
      ? eventAttribute.searchAttributes.indexedFields
      : eventAttribute.searchAttributes;
    Object.entries(searchAttributes).forEach(([key, value]) => {
      searchAttributes[key] = decodeRawPayload(value, returnDataOnly);
    });
  }

  // Decode Memo
  if (has(eventAttribute, 'memo') && has(eventAttribute.memo, 'fields')) {
    const memo = eventAttribute.memo.fields;

    Object.entries(memo).forEach(([key, value]) => {
      memo[key] = decodeRawPayload(value, returnDataOnly);
    });
  }

  // Decode Header
  if (has(eventAttribute, 'header') && has(eventAttribute.header, 'fields')) {
    const header = eventAttribute.header.fields;

    Object.entries(header).forEach(([key, value]) => {
      header[key] = decodeRawPayload(value, returnDataOnly);
    });
  }

  // Decode Query Result
  // This one is a best guess from the previous codebase and needs verified
  if (has(eventAttribute, 'queryResult')) {
    const queryResult = eventAttribute?.queryResult;

    Object.entries(queryResult).forEach(([key, value]) => {
      queryResult[key] = decodeRawPayload(value, returnDataOnly);
    });
  }

  return eventAttribute;
};

const decodePayloadsWithCodec = async (
  payloads: unknown[],
  returnDataOnly: boolean = true,
): Promise<unknown[]> => {
  const awaitData = await callCodecEndpoint({ payloads: { payloads } });
  return (awaitData?.payloads ?? []).map((p) =>
    decodeRawPayload(p, returnDataOnly),
  );
};

export const applyCodecToPayloads = async (
  payloads: unknown[],
): Promise<unknown[]> => {
  const awaitData = await callCodecEndpoint({ payloads: { payloads } });
  return awaitData?.payloads ?? [];
};

const keyIs = (key: string, ...validKeys: string[]) => {
  for (const validKey of validKeys) {
    if (key === validKey) return true;
  }
  return false;
};

export const decodeUserMetadataPayload = async (
  payload: RawPayload | Payload,
): Promise<string | Payload> => {
  try {
    const data = await decodePayloadsWithCodec([payload]);
    const result = data[0];
    return result || '';
  } catch {
    return '';
  }
};

export const isRawPayload = (payload: unknown): boolean => {
  if (!isObject(payload)) return false;
  const keys = Object.keys(payload);
  return (
    keys.length === 2 && keys.includes('metadata') && keys.includes('data')
  );
};

const decodeEventAttributesInternal = async (
  anyAttributes:
    | PotentiallyDecodable
    | EventAttribute
    | WorkflowEvent
    | Memo
    | null,
  decodeSetting: DownloadEventHistorySetting,
  returnDataOnly: boolean,
): Promise<
  PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo | null
> => {
  if (!anyAttributes) return anyAttributes;

  const decode =
    decodeSetting === 'readable'
      ? decodePayloadsWithCodec
      : applyCodecToPayloads;
  const clone = { ...anyAttributes };
  if (anyAttributes) {
    // Now that we can have single Payload that is not an array (Nexus)
    if (isRawPayload(clone)) {
      const data = toArray(clone as Payload);
      const decoded = await decode(data, returnDataOnly);
      return decoded?.[0] || clone;
    }

    for (const key of Object.keys(clone)) {
      if (keyIs(key, 'payloads', 'encodedAttributes') && clone[key]) {
        const data = toArray(clone[key]);
        const decoded = await decode(data, returnDataOnly);
        clone[key] = keyIs(key, 'encodedAttributes') ? decoded[0] : decoded;
      } else {
        const next = clone[key];
        if (isObject(next)) {
          clone[key] = await decodeEventAttributesInternal(
            next,
            decodeSetting,
            returnDataOnly,
          );
        }
      }
    }
  }

  return clone;
};

export const decodeEventAttributes = (
  anyAttributes:
    | PotentiallyDecodable
    | EventAttribute
    | WorkflowEvent
    | Memo
    | null,
  decodeSetting: DownloadEventHistorySetting = 'readable',
): Promise<
  PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo | null
> => decodeEventAttributesInternal(anyAttributes, decodeSetting, true);

export const decodeEventAttributesForExport = (
  anyAttributes:
    | PotentiallyDecodable
    | EventAttribute
    | WorkflowEvent
    | Memo
    | null,
  decodeSetting: DownloadEventHistorySetting = 'readable',
): Promise<
  PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo | null
> => decodeEventAttributesInternal(anyAttributes, decodeSetting, false);
