import {
  SignalWithStartWorkflowExecutionRequestSchema,
  SignalWithStartWorkflowExecutionResponseSchema,
} from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';
import { type DescMessage, fromBinary, toJson } from '@bufbuild/protobuf';

import type { Payload } from '$lib/types';

import { atob } from './atob';
import { isObject } from './is';

const SCHEMA_REGISTRY = new Map<string, DescMessage>([
  [
    'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest',
    SignalWithStartWorkflowExecutionRequestSchema,
  ],
  [
    'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse',
    SignalWithStartWorkflowExecutionResponseSchema,
  ],
]);

const base64ToUint8Array = (b64: string): Uint8Array => {
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

const looksLikeRawPayload = (n: unknown): boolean => {
  if (!n || typeof n !== 'object' || Array.isArray(n)) return false;
  const obj = n as Record<string, unknown>;
  return 'metadata' in obj && 'data' in obj && isObject(obj.metadata);
};

const recursivelyDecodeNestedPayloads = (
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
  recurse: (p: Payload) => unknown = (p) => p,
): { data: unknown } | null => {
  const rawEncoding = atob(String(payload?.metadata?.encoding ?? ''));
  const rawMessageType = atob(String(payload?.metadata?.messageType ?? ''));
  if (rawEncoding !== 'binary/protobuf' || !rawMessageType) return null;

  const schema = SCHEMA_REGISTRY.get(rawMessageType);
  if (!schema) return null;

  try {
    const bytes = base64ToUint8Array(String(payload?.data ?? ''));
    const message = fromBinary(schema, bytes);
    const raw = toJson(schema, message);
    const data = recursivelyDecodeNestedPayloads(raw, recurse);
    return { data };
  } catch (e) {
    console.warn(
      `Could not decode binary/protobuf payload (${rawMessageType}):`,
      e,
    );
    return null;
  }
};
