import { describe, expect, it } from 'vitest';

import { describeNexusOperation } from './nexus-operation-registry';

const SignalWithStartBinaryProtobuf = {
  metadata: {
    encoding: 'YmluYXJ5L3Byb3RvYnVm',
    messageType:
      'dGVtcG9yYWwuYXBpLndvcmtmbG93c2VydmljZS52MS5TaWduYWxXaXRoU3RhcnRXb3JrZmxvd0V4ZWN1dGlvblJlcXVlc3Q=',
  },
  data: 'CgdkZWZhdWx0EhhzeXN0ZW0tbmV4dXMtd29ya2Zsb3ctaWQaDgoMRWNob1dvcmtmbG93IiYKJGZiZjdhNWQyLWY3ZWQtNGMyYi04MmI2LWZjZmVlNWQyZDJhNlgBYgt0ZXN0LXNpZ25hbA==',
};

const JsonPayload = {
  metadata: { encoding: 'anNvbi9wbGFpbg==' },
  data: 'InRlc3RAdGVzdC5jb20i',
};

const UnknownProtobuf = {
  metadata: {
    encoding: 'YmluYXJ5L3Byb3RvYnVm',
    messageType: btoa('temporal.api.history.v1.HistoryEvent'),
  },
  data: 'CgVoZWxsbw==',
};

describe('describeNexusOperation', () => {
  it('returns a descriptor with kind signal-with-start-workflow for SignalWithStart fixture', () => {
    const result = describeNexusOperation(SignalWithStartBinaryProtobuf);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('signal-with-start-workflow');
  });

  it('returns a descriptor with a label containing the workflow type name', () => {
    const result = describeNexusOperation(SignalWithStartBinaryProtobuf);
    expect(result).not.toBeNull();
    expect(result?.label).toContain('EchoWorkflow');
  });

  it('returns null for a non-binary/protobuf payload', () => {
    const result = describeNexusOperation(JsonPayload);
    expect(result).toBeNull();
  });

  it('returns null for a binary/protobuf payload with an unknown messageType', () => {
    const result = describeNexusOperation(UnknownProtobuf);
    expect(result).toBeNull();
  });

  it('returns a descriptor with signalName from the fixture data', () => {
    const result = describeNexusOperation(SignalWithStartBinaryProtobuf);
    expect(result?.signalName).toBe('test-signal');
  });

  it('returns a descriptor with workflowId from the fixture data', () => {
    const result = describeNexusOperation(SignalWithStartBinaryProtobuf);
    expect(result?.workflowId).toBe('system-nexus-workflow-id');
  });
});
