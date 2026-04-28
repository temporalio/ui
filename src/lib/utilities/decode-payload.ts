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
  decodeAttributes?: typeof parsePayloadAttributes;
};

/**
 * Decoding TL;DR
 * Decoding includes either 1 or 2 phases - "parse" and "decode"
 * "Parse" (Phase 1) refers to the act of deserializing a base64-encoded string into a JSON object
 * "Decode" (Phase 2) refers to the act of applying a Codec to a Payload via a remote Codec Server (configured by users)
 *
 * Many primitives that are or contain Payloads only need to to undergo Phase 1. These primitives include:
 * Workflow Memo
 * Workflow Header
 * Search Attributes
 *
 * The primitives that are or contain Payloads that may need to undergo Phase 1 include
 * Activity Inputs
 * Activity Results
 * Query Results
 * Stack Traces
 */

/** Normalises a single Payload or an array of Payloads into an array. */
const toArray = (payloads: Payload | Payload[]): Payload[] => {
  if (Array.isArray(payloads)) {
    return payloads;
  } else {
    return [payloads];
  }
};

/** Decodes every Base64-encoded value in any Record to a plain string. */
const parseBase64ObjectValues = (
  anyObject: Record<string, unknown>,
): Record<string, string> => {
  const parsed: Record<string, string> = {};
  for (const key in anyObject) {
    parsed[key] = atob(String(anyObject[key]));
  }
  return parsed;
};

/**
 * Phase 1 — synchronous, no network.
 *
 * Base64-decodes `payload.data` and returns the parsed JS value.
 * When `returnDataOnly` is `false` the full `{ metadata, data }` object is
 * returned instead of just `data`.
 *
 * Returns `null` for `binary/null`-encoded payloads and returns the original
 * `payload` unchanged when decoding fails (e.g. encrypted payloads).
 */
export function parseRawPayloadToJSON(
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
    const metadata = parseBase64ObjectValues(payload?.metadata);
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
    const metadata = parseBase64ObjectValues(payload?.metadata);
    return {
      metadata,
      data: null,
    };
  }

  return payload;
}

/**
 * Phase 1 — synchronous, no network.
 *
 * Walks an object and Base64-decodes every payload found in
 * `searchAttributes`, `memo.fields`, `header.fields`, and `queryResult`.
 * Mutates the object in place and returns it.
 */
export const parsePayloadAttributes = <
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
      searchAttributes[key] = parseRawPayloadToJSON(value, returnDataOnly);
    });
  }

  // Decode Memo
  if (has(eventAttribute, 'memo') && has(eventAttribute.memo, 'fields')) {
    const memo = eventAttribute.memo.fields;

    Object.entries(memo).forEach(([key, value]) => {
      memo[key] = parseRawPayloadToJSON(value, returnDataOnly);
    });
  }

  // Decode Header
  if (has(eventAttribute, 'header') && has(eventAttribute.header, 'fields')) {
    const header = eventAttribute.header.fields;

    Object.entries(header).forEach(([key, value]) => {
      header[key] = parseRawPayloadToJSON(value, returnDataOnly);
    });
  }

  // Decode Query Result
  // This one is a best guess from the previous codebase and needs verified
  if (has(eventAttribute, 'queryResult')) {
    const queryResult = eventAttribute?.queryResult;

    Object.entries(queryResult).forEach(([key, value]) => {
      queryResult[key] = parseRawPayloadToJSON(value, returnDataOnly);
    });
  }

  return eventAttribute;
};

/**
 * Phase 2 + Phase 1 (internal).
 * Sends `payloads` through the remote codec server, then Base64-decodes each
 * result with {@link parseRawPayloadToJSON}.
 */
const decodePayloadsWithRemoteCodecAndParseRawPayloadToJSON = async (
  payloads: unknown[],
  returnDataOnly: boolean = true,
): Promise<unknown[]> => {
  const awaitData = await callCodecEndpoint({ payloads: { payloads } });
  return (awaitData?.payloads ?? []).map((p) =>
    parseRawPayloadToJSON(p, returnDataOnly),
  );
};

/**
 * Phase 2 — async, requires a configured codec endpoint.
 *
 * Sends `payloads` through the remote codec server and returns the raw
 * decoded payloads without further Base64-decoding. Use this when the
 * caller needs the full Payload shape (e.g. for re-serialisation on export).
 */
export const decodePayloadsWithRemoteCodec = async (
  payloads: unknown[],
): Promise<unknown[]> => {
  const awaitData = await callCodecEndpoint({ payloads: { payloads } });
  return awaitData?.payloads ?? [];
};

/** Returns true if `key` matches any of the provided `validKeys`. */
const keyIs = (key: string, ...validKeys: string[]) => {
  for (const validKey of validKeys) {
    if (key === validKey) return true;
  }
  return false;
};

/**
 * Phase 2 — async, requires a configured codec endpoint.
 *
 * Decodes a single user-metadata payload (`summary` or `details` field on a
 * workflow) through the remote codec server. Returns the decoded string value
 * or the original Payload object; returns an empty string on error.
 */
export const decodeUserMetadata = async (
  payload: RawPayload | Payload,
): Promise<string | Payload> => {
  try {
    const data = await decodePayloadsWithRemoteCodec([payload]);
    const result = data[0];
    return parseRawPayloadToJSON(result) || '';
  } catch {
    return '';
  }
};

/**
 * Returns `true` when `payload` has exactly the `{ metadata, data }` shape of
 * a raw Temporal Payload object. Used to distinguish a bare Payload from a
 * map of payloads.
 */
export const isRawPayload = (payload: unknown): boolean => {
  if (!isObject(payload)) return false;
  const keys = Object.keys(payload);
  return (
    keys.length === 2 && keys.includes('metadata') && keys.includes('data')
  );
};

/**
 * Phase 2 internal implementation shared by {@link decodeEventAttributes} and
 * {@link decodeEventAttributesForExport}.
 *
 * Recursively walks `anyAttributes`, finds every `payloads` /
 * `encodedAttributes` array, and routes each through the codec server.
 * When `decodeSetting` is `'readable'`, each result is also Base64-decoded
 * (Phase 1). When it is not `'readable'`, raw codec-server payloads are
 * returned so the caller (e.g. export) can serialise them faithfully.
 */
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
      ? decodePayloadsWithRemoteCodecAndParseRawPayloadToJSON
      : decodePayloadsWithRemoteCodec;
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

/**
 * Phase 2 + Phase 1 — async, requires a configured codec endpoint.
 *
 * Decodes all payloads within `anyAttributes` through the remote codec server
 * and then Base64-decodes each result to a plain JS value (`returnDataOnly =
 * true`). Use this for display; decoded values are human-readable.
 *
 * @see decodeEventAttributesForExport for the export / download variant that
 * preserves the full Payload shape.
 */
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

/**
 * Phase 2 only — async, requires a configured codec endpoint.
 *
 * Like {@link decodeEventAttributes} but keeps the full `{ metadata, data }`
 * Payload shape after codec decoding (`returnDataOnly = false`). Use this when
 * the result will be re-serialised (e.g. JSON history export / download).
 */
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
