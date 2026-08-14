import {
  SignalWithStartWorkflowExecutionRequestSchema,
  SignalWithStartWorkflowExecutionResponseSchema,
} from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';
import { create, type DescMessage, toBinary } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';

import {
  describeNexusOperation,
  describeNexusResponse,
} from './nexus-operation-registry';

const toBinaryPayload = (
  schema: DescMessage,
  message: unknown,
  messageType: string,
) => {
  const bytes = toBinary(schema, message as never);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return {
    metadata: {
      encoding: btoa('binary/protobuf'),
      messageType: btoa(messageType),
    },
    data: btoa(binary),
  };
};

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

  it('returns a descriptor with a label for the operation', () => {
    const result = describeNexusOperation(SignalWithStartBinaryProtobuf);
    expect(result).not.toBeNull();
    expect(result?.label).toBe('Signal With Start Workflow Execution');
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

  it('returns a descriptor with namespace from the fixture data', () => {
    const result = describeNexusOperation(SignalWithStartBinaryProtobuf);
    expect(result?.namespace).toBe('default');
  });

  it('returns control and identity when the request carries them', () => {
    const payload = toBinaryPayload(
      SignalWithStartWorkflowExecutionRequestSchema,
      create(SignalWithStartWorkflowExecutionRequestSchema, {
        namespace: 'default',
        workflowId: 'target-workflow-id',
        signalName: 'test-signal',
        identity: 'test-identity',
        control: 'test-control',
      }),
      'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest',
    );

    const result = describeNexusOperation(payload);
    expect(result?.identity).toBe('test-identity');
    expect(result?.control).toBe('test-control');
  });

  it('leaves control and identity undefined when absent from the request', () => {
    const result = describeNexusOperation(SignalWithStartBinaryProtobuf);
    expect(result?.identity).toBeUndefined();
    expect(result?.control).toBeUndefined();
  });
});

describe('describeNexusResponse', () => {
  const responsePayload = (init: Record<string, unknown>) =>
    toBinaryPayload(
      SignalWithStartWorkflowExecutionResponseSchema,
      create(SignalWithStartWorkflowExecutionResponseSchema, init),
      'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse',
    );

  it('returns null for a payload that is not a known system Nexus response', () => {
    expect(describeNexusResponse(JsonPayload)).toBeNull();
  });

  it('returns runId and started from the response', () => {
    const result = describeNexusResponse(
      responsePayload({ runId: 'target-run-id', started: true }),
    );
    expect(result?.label).toBe('Signal With Start Workflow Execution');
    expect(result?.runId).toBe('target-run-id');
    expect(result?.started).toBe(true);
  });

  it('extracts the target execution from signalLink', () => {
    const result = describeNexusResponse(
      responsePayload({
        runId: 'target-run-id',
        started: false,
        signalLink: {
          variant: {
            case: 'workflowEvent',
            value: {
              namespace: 'target-namespace',
              workflowId: 'target-workflow-id',
              runId: 'target-run-id',
              reference: {
                case: 'eventRef',
                value: { eventId: 5n },
              },
            },
          },
        },
      }),
    );

    expect(result?.target).toEqual({
      namespace: 'target-namespace',
      workflowId: 'target-workflow-id',
      runId: 'target-run-id',
      eventId: '5',
    });
  });

  it('leaves target undefined when the response carries no signalLink', () => {
    const result = describeNexusResponse(
      responsePayload({ runId: 'target-run-id', started: true }),
    );
    expect(result?.target).toBeUndefined();
  });
});
