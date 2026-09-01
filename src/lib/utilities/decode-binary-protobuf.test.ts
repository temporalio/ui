import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestSchema } from '$lib/system-nexus-endpoints/signal-with-start-workflow/schemas';

import { decodeBinaryProtobuf } from './decode-binary-protobuf';

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
    const result = decodeBinaryProtobuf(
      SignalWithStartBinaryProtobuf,
      requestSchema,
    ) as {
      data: Record<string, unknown>;
    } | null;
    expect(result).not.toBeNull();
    expect(result?.data.namespace).toBe('default');
    expect(result?.data.workflowId).toBe('system-nexus-workflow-id');
  });

  it('accepts a recurse callback and does not call it when no nested payloads are present', () => {
    const recurse = vi.fn((p) => p);
    const result = decodeBinaryProtobuf(
      SignalWithStartBinaryProtobuf,
      requestSchema,
      recurse,
    );
    expect(result).not.toBeNull();
    expect(recurse).not.toHaveBeenCalled();
  });

  it('returns null and DOES warn when fromBinary throws on corrupt data', () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const result = decodeBinaryProtobuf(
      {
        metadata: {
          encoding: 'YmluYXJ5L3Byb3RvYnVm',
          messageType:
            'dGVtcG9yYWwuYXBpLndvcmtmbG93c2VydmljZS52MS5TaWduYWxXaXRoU3RhcnRXb3JrZmxvd0V4ZWN1dGlvblJlcXVlc3Q=',
        },
        data: btoa('this is not valid protobuf binary data!!!'),
      },
      requestSchema,
    );
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain('binary/protobuf');
  });

  it('returns null when encoding is not binary/protobuf', () => {
    const result = decodeBinaryProtobuf(
      {
        metadata: { encoding: 'anNvbi9wbGFpbg==', messageType: btoa('foo') },
        data: 'dGVzdA==',
      },
      requestSchema,
    );
    expect(result).toBeNull();
  });

  it('returns null when messageType is missing', () => {
    const result = decodeBinaryProtobuf(
      {
        metadata: { encoding: 'YmluYXJ5L3Byb3RvYnVm' },
        data: 'CgVoZWxsbw==',
      },
      requestSchema,
    );
    expect(result).toBeNull();
  });
});
