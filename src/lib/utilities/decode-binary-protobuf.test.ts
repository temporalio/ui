import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  decodeBinaryProtobuf,
  looksLikeRawPayload,
  recursivelyDecodeNestedPayloads,
} from './decode-binary-protobuf';

const SignalWithStartBinaryProtobuf = {
  metadata: {
    encoding: 'YmluYXJ5L3Byb3RvYnVm',
    messageType:
      'dGVtcG9yYWwuYXBpLndvcmtmbG93c2VydmljZS52MS5TaWduYWxXaXRoU3RhcnRXb3JrZmxvd0V4ZWN1dGlvblJlcXVlc3Q=',
  },
  data: 'CgdkZWZhdWx0EhhzeXN0ZW0tbmV4dXMtd29ya2Zsb3ctaWQaDgoMRWNob1dvcmtmbG93IiYKJGZiZjdhNWQyLWY3ZWQtNGMyYi04MmI2LWZjZmVlNWQyZDJhNlgBYgt0ZXN0LXNpZ25hbA==',
};

describe('decodeBinaryProtobuf', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('decodes a valid binary/protobuf payload', () => {
    const result = decodeBinaryProtobuf(SignalWithStartBinaryProtobuf) as {
      data: Record<string, unknown>;
    } | null;
    expect(result).not.toBeNull();
    expect(result?.data.namespace).toBe('default');
    expect(result?.data.workflowId).toBe('system-nexus-workflow-id');
  });

  it('returns null and does NOT warn when messageType does not resolve to a known type', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const result = decodeBinaryProtobuf({
      metadata: {
        encoding: 'YmluYXJ5L3Byb3RvYnVm',
        messageType: btoa('not.a.real.MessageType'),
      },
      data: 'CgVoZWxsbw==',
    });
    expect(result).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns null and does NOT warn when messageType resolves to a namespace, not a message', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const result = decodeBinaryProtobuf({
      metadata: {
        encoding: 'YmluYXJ5L3Byb3RvYnVm',
        messageType: btoa('temporal.api'),
      },
      data: 'CgVoZWxsbw==',
    });
    expect(result).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns null and DOES warn when T.decode throws on corrupt data', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const result = decodeBinaryProtobuf({
      metadata: {
        encoding: 'YmluYXJ5L3Byb3RvYnVm',
        messageType:
          'dGVtcG9yYWwuYXBpLndvcmtmbG93c2VydmljZS52MS5TaWduYWxXaXRoU3RhcnRXb3JrZmxvd0V4ZWN1dGlvblJlcXVlc3Q=',
      },
      data: btoa('this is not valid protobuf binary data!!!'),
    });
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain('binary/protobuf');
  });

  it('returns null when encoding is not binary/protobuf', () => {
    const result = decodeBinaryProtobuf({
      metadata: { encoding: 'anNvbi9wbGFpbg==', messageType: btoa('foo') },
      data: 'dGVzdA==',
    });
    expect(result).toBeNull();
  });

  it('returns null when messageType is missing', () => {
    const result = decodeBinaryProtobuf({
      metadata: { encoding: 'YmluYXJ5L3Byb3RvYnVm' },
      data: 'CgVoZWxsbw==',
    });
    expect(result).toBeNull();
  });
});

describe('looksLikeRawPayload', () => {
  it('returns true for an object with metadata object and data', () => {
    expect(looksLikeRawPayload({ metadata: {}, data: '' })).toBe(true);
  });

  it('returns false for an array', () => {
    expect(looksLikeRawPayload([])).toBe(false);
  });

  it('returns false for a primitive', () => {
    expect(looksLikeRawPayload('string')).toBe(false);
    expect(looksLikeRawPayload(42)).toBe(false);
    expect(looksLikeRawPayload(null)).toBe(false);
  });

  it('returns false when metadata is not an object', () => {
    expect(looksLikeRawPayload({ metadata: 'string', data: '' })).toBe(false);
  });

  it('returns false when data field is missing', () => {
    expect(looksLikeRawPayload({ metadata: {} })).toBe(false);
  });

  it('returns false when metadata field is missing', () => {
    expect(looksLikeRawPayload({ data: '' })).toBe(false);
  });
});

describe('recursivelyDecodeNestedPayloads', () => {
  it('passes through primitives unchanged', () => {
    const recurse = vi.fn();
    expect(recursivelyDecodeNestedPayloads('hello', recurse)).toBe('hello');
    expect(recursivelyDecodeNestedPayloads(42, recurse)).toBe(42);
    expect(recursivelyDecodeNestedPayloads(null, recurse)).toBe(null);
    expect(recurse).not.toHaveBeenCalled();
  });

  it('maps over arrays recursively', () => {
    const recurse = vi.fn();
    const result = recursivelyDecodeNestedPayloads([1, 2, 3], recurse);
    expect(result).toEqual([1, 2, 3]);
  });

  it('calls recurse callback for payload-shaped objects', () => {
    const payload = { metadata: { encoding: 'abc' }, data: 'xyz' };
    const recurse = vi.fn().mockReturnValue('decoded');
    const result = recursivelyDecodeNestedPayloads(payload, recurse);
    expect(recurse).toHaveBeenCalledWith(payload);
    expect(result).toBe('decoded');
  });

  it('recursively walks plain objects', () => {
    const recurse = vi.fn((p) => `decoded:${JSON.stringify(p)}`);
    const nested = { metadata: { encoding: 'abc' }, data: 'xyz' };
    const node = { outer: { inner: nested } };
    const result = recursivelyDecodeNestedPayloads(node, recurse) as Record<
      string,
      unknown
    >;
    expect(recurse).toHaveBeenCalledWith(nested);
    expect((result.outer as Record<string, unknown>).inner).toBe(
      `decoded:${JSON.stringify(nested)}`,
    );
  });

  it('returns the node unchanged when recurse returns the same object', () => {
    const payload = { metadata: { encoding: 'abc' }, data: 'xyz' };
    const recurse = vi.fn().mockReturnValue(payload);
    const result = recursivelyDecodeNestedPayloads(payload, recurse);
    expect(result).toBe(payload);
  });
});
