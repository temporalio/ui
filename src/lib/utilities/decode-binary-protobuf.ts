import * as temporalProto from '@temporalio/proto';

import type { Payload } from '$lib/types';

import { atob } from './atob';
import { isObject } from './is';

type ProtobufType = {
  decode: (bytes: Uint8Array) => unknown;
  toObject: (
    msg: unknown,
    opts?: Record<string, unknown>,
  ) => Record<string, unknown>;
};

export const lookupTemporalProtoType = (fqn: string): ProtobufType | null => {
  const parts = fqn.split('.');
  let cur: unknown = temporalProto;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (
    cur &&
    typeof (cur as ProtobufType).decode === 'function' &&
    typeof (cur as ProtobufType).toObject === 'function'
  ) {
    return cur as ProtobufType;
  }
  return null;
};

export const base64ToUint8Array = (b64: string): Uint8Array => {
  // The local `./atob` does UTF-8 decoding via decodeURIComponent — fine for
  // JSON text, fatal for raw protobuf bytes. Use the raw browser atob here.
  const binary =
    typeof globalThis.atob === 'function'
      ? globalThis.atob(b64)
      : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const looksLikeRawPayload = (n: unknown): boolean => {
  if (!n || typeof n !== 'object' || Array.isArray(n)) return false;
  const obj = n as Record<string, unknown>;
  return 'metadata' in obj && 'data' in obj && isObject(obj.metadata);
};

export const recursivelyDecodeNestedPayloads = (
  node: unknown,
  recurse: (p: Payload) => unknown,
): unknown => {
  if (Array.isArray(node))
    return node.map((item) => recursivelyDecodeNestedPayloads(item, recurse));
  if (!node || typeof node !== 'object') return node;
  if (looksLikeRawPayload(node)) {
    const decoded = recurse(node as Payload);
    if (decoded === node) return node;
    return recursivelyDecodeNestedPayloads(decoded, recurse);
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    out[k] = recursivelyDecodeNestedPayloads(v, recurse);
  }
  return out;
};

export const decodeBinaryProtobuf = (
  payload: Payload,
): { data: unknown } | null => {
  const rawEncoding = atob(String(payload?.metadata?.encoding ?? ''));
  const rawMessageType = atob(String(payload?.metadata?.messageType ?? ''));
  if (rawEncoding !== 'binary/protobuf' || !rawMessageType) return null;

  const T = lookupTemporalProtoType(rawMessageType);
  if (!T) return null;

  try {
    const bytes = base64ToUint8Array(String(payload?.data ?? ''));
    const data = T.toObject(T.decode(bytes), {
      longs: String,
      enums: String,
      bytes: String,
      defaults: false,
    });
    return { data };
  } catch (e) {
    console.warn(
      `Could not decode binary/protobuf payload (${rawMessageType}):`,
      e,
    );
    return null;
  }
};
