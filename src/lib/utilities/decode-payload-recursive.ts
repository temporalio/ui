import type { Payload as ProtobufPayload } from '$lib/types';
import type { Payload } from '$lib/types/events';

import { atob } from './atob';
import { has } from './has';
import { isObject } from './is';
import { parseWithBigInt } from './parse-with-big-int';

/**
 * Payload phase system — tagged types for tracking decode state.
 *
 * The pipeline flows:
 *   BytePayload (protobuf Uint8Array) -> RawPayload (base64 strings) -> ParsedPayload (phase: 'parsed') -> DecodedPayload (phase: 'decoded')
 *
 * BytePayload is the protobuf type from the Temporal SDK (Uint8Array fields).
 * RawPayload is the JSON-serialized form with base64 strings.
 *
 * parsePayload() accepts any UnparsedPayload — including BytePayload with
 * Uint8Array fields. If it detects Uint8Array data at runtime, it converts
 * to base64 strings before decoding. This means parsePayload() is the single
 * entry point for ANY payload shape, regardless of transport format.
 *
 * The type system prevents passing already-parsed payloads back in
 * (phase: 'parsed' or 'decoded' are not assignable to UnparsedPayload).
 *
 * parsePayload() converts unparsed -> Parsed:
 *   - Converts Uint8Array fields to base64 strings (if present)
 *   - atob() each metadata value
 *   - atob() + parseWithBigInt() the data field
 *   - Handles binary/null encoding -> null data
 *   - On error: keeps last valid value, adds to errors
 *
 * Future: async decode (remote codec) converts Parsed -> Decoded.
 *
 * Future enhancement: replace string-based phase tags with branded
 * types (e.g., `{ readonly __raw: unique symbol }`) for even stronger
 * compile-time guarantees without runtime overhead.
 */
export type PayloadErrors = {
  data?: string;
  metadata?: string;
};

export type BytePayload = ProtobufPayload & {
  phase?: never;
};

export type RawPayload = Payload & {
  phase?: 'raw';
};

export type UnparsedPayload = {
  metadata?: Record<string, string | Uint8Array> | null;
  data?: string | Uint8Array | null;
  phase?: never | 'raw';
};

export type ParsedPayload = {
  metadata?: Record<string, string>;
  data?: unknown;
  phase: 'parsed';
  errors?: PayloadErrors;
};

export type DecodedPayload = {
  metadata?: Record<string, string>;
  data?: unknown;
  phase: 'decoded';
  errors?: PayloadErrors;
};

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function isUnparsedPayload(obj: unknown): obj is UnparsedPayload {
  if (!isObject(obj)) return false;
  if ('phase' in obj && obj.phase !== 'raw' && obj.phase !== undefined)
    return false;
  const hasMetadata = has(obj, 'metadata');
  const hasData = has(obj, 'data');
  if (!hasMetadata && !hasData) return false;
  if (hasMetadata && !isObject(obj.metadata) && obj.metadata != null)
    return false;
  if (
    hasData &&
    typeof obj.data !== 'string' &&
    !(obj.data instanceof Uint8Array || ArrayBuffer.isView(obj.data)) &&
    obj.data != null
  )
    return false;
  return true;
}

export function parsePayload(raw: UnparsedPayload): ParsedPayload {
  if (raw == null) {
    return { data: null, phase: 'parsed' };
  }

  const errors: PayloadErrors = {};

  let decodedMetadata: Record<string, string> | undefined;
  if (raw.metadata != null) {
    try {
      decodedMetadata = Object.entries(raw.metadata).reduce(
        (acc, [key, value]) => {
          const str =
            value instanceof Uint8Array || ArrayBuffer.isView(value)
              ? uint8ToBase64(value as Uint8Array)
              : String(value);
          acc[key] = atob(str);
          return acc;
        },
        {} as Record<string, string>,
      );
    } catch (e) {
      errors.metadata = e instanceof Error ? e.message : String(e);
      decodedMetadata = Object.entries(raw.metadata).reduce(
        (acc, [key, value]) => {
          acc[key] =
            value instanceof Uint8Array || ArrayBuffer.isView(value)
              ? uint8ToBase64(value as Uint8Array)
              : String(value);
          return acc;
        },
        {} as Record<string, string>,
      );
    }
  }

  const encoding = decodedMetadata?.encoding;
  if (encoding === 'binary/null') {
    const result: ParsedPayload = {
      metadata: decodedMetadata,
      data: null,
      phase: 'parsed',
    };
    if (Object.keys(errors).length) result.errors = errors;
    return result;
  }

  const rawData =
    raw.data instanceof Uint8Array || ArrayBuffer.isView(raw.data)
      ? uint8ToBase64(raw.data as Uint8Array)
      : raw.data;
  let data: unknown = rawData;
  if (rawData != null && rawData !== '') {
    try {
      const atobResult = atob(String(rawData));
      data = atobResult;
      try {
        data = parseWithBigInt(atobResult);
      } catch (e) {
        errors.data = e instanceof Error ? e.message : String(e);
      }
    } catch (e) {
      errors.data = e instanceof Error ? e.message : String(e);
    }
  } else {
    data = null;
  }

  const result: ParsedPayload = {
    metadata: decodedMetadata,
    data,
    phase: 'parsed',
  };
  if (Object.keys(errors).length) result.errors = errors;
  return result;
}

export function parsePayloadAttributes<T>(obj: T): T {
  if (obj == null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const item = obj[i];
      if (isUnparsedPayload(item)) {
        obj[i] = parsePayload(item);
      } else if (typeof item === 'object' && item != null) {
        parsePayloadAttributes(item);
      }
    }
    return obj;
  }

  if (isUnparsedPayload(obj)) {
    return parsePayload(obj as UnparsedPayload) as T;
  }

  const record = obj as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (isUnparsedPayload(value)) {
      record[key] = parsePayload(value);
    } else if (Array.isArray(value)) {
      parsePayloadAttributes(value);
    } else if (isObject(value)) {
      parsePayloadAttributes(value);
    }
  }

  return obj;
}
