import type { Payload } from '$lib/types/events';

import { atob } from './atob';
import { has } from './has';
import { isObject } from './is';
import { parseWithBigInt } from './parse-with-big-int';

/**
 * Payload phase system — tagged types for tracking decode state.
 *
 * The pipeline flows:
 *   UnparsedPayload (base64 strings) -> ParsedPayload (phase: 'parsed') -> DecodedPayload (phase: 'decoded')
 *
 * UnparsedPayload extends the events Payload type with phase?: never,
 * preventing already-parsed payloads from being passed back in.
 *
 * parsePayload() accepts any UnparsedPayload and returns ParsedPayload.
 * The type system prevents passing already-parsed payloads back in
 * (phase: 'parsed' or 'decoded' are not assignable to UnparsedPayload).
 *
 * parsePayload() converts unparsed -> Parsed:
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

export type UnparsedPayload = Payload & {
  phase?: never;
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

function hasPayloadShape(obj: unknown): obj is UnparsedPayload {
  if (!isObject(obj)) return false;
  if ('phase' in obj) return false;

  const hasMetadata = has(obj, 'metadata');
  const hasData = has(obj, 'data');

  if (!hasMetadata && !hasData) return false;
  if (hasMetadata && !isObject(obj.metadata) && obj.metadata != null)
    return false;
  if (hasData && typeof obj.data !== 'string' && obj.data != null) return false;

  return true;
}

function hasErrors(errors: PayloadErrors): boolean {
  return errors.data !== undefined || errors.metadata !== undefined;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function isBinaryNull(encoding: string | undefined): boolean {
  return encoding === 'binary/null';
}

function hasContent(value: string | undefined | null): value is string {
  return value != null && value !== '';
}

function decodeMetadataFields(
  metadata: Record<string, string>,
): [Record<string, string>, string | undefined] {
  const decoded: Record<string, string> = {};
  let error: string | undefined;

  Object.entries(metadata).forEach(([key, value]) => {
    try {
      decoded[key] = atob(String(value));
    } catch (e) {
      error = errorMessage(e);
      decoded[key] = String(value);
    }
  });

  return [decoded, error];
}

function decodeDataField(data: string): [unknown, string | undefined] {
  try {
    const decoded = atob(data);
    try {
      return [parseWithBigInt(decoded), undefined];
    } catch (e) {
      return [decoded, errorMessage(e)];
    }
  } catch (e) {
    return [data, errorMessage(e)];
  }
}

function buildResult(
  metadata: Record<string, string> | undefined,
  data: unknown,
  errors: PayloadErrors,
): ParsedPayload {
  const result: ParsedPayload = { metadata, data, phase: 'parsed' };
  if (hasErrors(errors)) result.errors = errors;
  return result;
}

export function parsePayload(raw: UnparsedPayload): ParsedPayload {
  if (raw == null) return buildResult(undefined, null, {});

  const errors: PayloadErrors = {};

  let decodedMetadata: Record<string, string> | undefined;
  if (raw.metadata != null) {
    const [decoded, metadataError] = decodeMetadataFields(raw.metadata);
    decodedMetadata = decoded;
    if (metadataError) errors.metadata = metadataError;
  }

  if (isBinaryNull(decodedMetadata?.encoding)) {
    return buildResult(decodedMetadata, null, errors);
  }

  if (!hasContent(raw.data)) {
    return buildResult(decodedMetadata, null, errors);
  }

  const [data, dataError] = decodeDataField(raw.data);
  if (dataError) errors.data = dataError;

  return buildResult(decodedMetadata, data, errors);
}

export function parsePayloadAttributes<T>(obj: T): T {
  if (obj == null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      if (hasPayloadShape(item)) {
        obj[i] = parsePayload(item);
      } else if (isObject(item)) {
        parsePayloadAttributes(item);
      }
    });
    return obj;
  }

  if (hasPayloadShape(obj)) {
    return parsePayload(obj as UnparsedPayload) as T;
  }

  const record = obj as Record<string, unknown>;
  Object.entries(record).forEach(([key, value]) => {
    if (hasPayloadShape(value)) {
      record[key] = parsePayload(value);
    } else if (Array.isArray(value)) {
      parsePayloadAttributes(value);
    } else if (isObject(value)) {
      parsePayloadAttributes(value);
    }
  });

  return obj;
}
