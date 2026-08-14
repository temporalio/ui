import {
  SignalWithStartWorkflowExecutionRequestSchema,
  SignalWithStartWorkflowExecutionResponseSchema,
} from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';
import { create, type DescMessage, toBinary } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';

import type { WorkflowEvent } from '$lib/types/events';

import { getSystemNexusEventDisplay } from './get-system-nexus-event-display';

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

const requestPayload = (init: Record<string, unknown>) =>
  toBinaryPayload(
    SignalWithStartWorkflowExecutionRequestSchema,
    create(SignalWithStartWorkflowExecutionRequestSchema, init),
    'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest',
  );

const responsePayload = (init: Record<string, unknown>) =>
  toBinaryPayload(
    SignalWithStartWorkflowExecutionResponseSchema,
    create(SignalWithStartWorkflowExecutionResponseSchema, init),
    'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse',
  );

const scheduledEvent = (
  init: Record<string, unknown>,
  endpoint = '__temporal_system',
) =>
  ({
    id: '5',
    name: 'NexusOperationScheduled',
    nexusOperationScheduledEventAttributes: {
      endpoint,
      service: 'temporal.api.workflowservice.v1.WorkflowService',
      operation: 'SignalWithStartWorkflowExecution',
      input: requestPayload(init),
    },
  }) as unknown as WorkflowEvent;

const completedEvent = (
  init: Record<string, unknown>,
  scheduledEventId = '5',
) =>
  ({
    id: '6',
    name: 'NexusOperationCompleted',
    nexusOperationCompletedEventAttributes: {
      scheduledEventId,
      result: responsePayload(init),
    },
  }) as unknown as WorkflowEvent;

describe('getSystemNexusEventDisplay', () => {
  it('returns null for a Nexus operation on a non-system endpoint', () => {
    const event = scheduledEvent(
      { workflowId: 'target-workflow-id' },
      'my-endpoint',
    );
    expect(getSystemNexusEventDisplay(event)).toBeNull();
  });

  it('renames the scheduled event to Initiated', () => {
    const display = getSystemNexusEventDisplay(
      scheduledEvent({ workflowId: 'target-workflow-id' }),
    );
    expect(display?.displayName).toBe(
      'Signal With Start Workflow Execution Initiated',
    );
  });

  it('renames the completed event to Delivered', () => {
    const display = getSystemNexusEventDisplay(
      completedEvent({ runId: 'target-run-id', started: true }),
    );
    expect(display?.displayName).toBe(
      'Signal With Start Workflow Execution Delivered',
    );
  });

  it('surfaces signalName, identity and control on the initiated event', () => {
    const display = getSystemNexusEventDisplay(
      scheduledEvent({
        namespace: 'default',
        workflowId: 'target-workflow-id',
        signalName: 'test-signal',
        identity: 'test-identity',
        control: 'test-control',
      }),
    );

    expect(display?.extraAttributes).toEqual({
      signalName: 'test-signal',
      identity: 'test-identity',
      control: 'test-control',
    });
  });

  it('omits identity and control when the request does not carry them', () => {
    const display = getSystemNexusEventDisplay(
      scheduledEvent({
        workflowId: 'target-workflow-id',
        signalName: 'test-signal',
      }),
    );

    expect(display?.extraAttributes).toEqual({ signalName: 'test-signal' });
  });

  it('links the initiated event to the target execution by workflow id', () => {
    const display = getSystemNexusEventDisplay(
      scheduledEvent({
        namespace: 'target-namespace',
        workflowId: 'target-workflow-id',
      }),
    );

    const link = display?.extraLinks?.[0];
    expect(link?.label).toBe('Target Execution');
    expect(link?.value).toBe('target-workflow-id');
    expect(link?.href).toContain('target-namespace');
  });

  it('hides the raw Nexus wrapper fields', () => {
    const display = getSystemNexusEventDisplay(
      scheduledEvent({ workflowId: 'target-workflow-id' }),
    );

    expect(display?.hiddenFields).toEqual(
      expect.arrayContaining(['endpoint', 'service', 'operation', 'requestId']),
    );
  });

  it('relabels scheduledEventId as initiatedEventId on the delivered event', () => {
    const display = getSystemNexusEventDisplay(
      completedEvent({ runId: 'target-run-id', started: true }, '5'),
    );

    expect(display?.extraAttributes).toEqual({ initiatedEventId: '5' });
    expect(display?.hiddenFields).toContain('scheduledEventId');
  });

  it('links the delivered event to the exact target run from signalLink', () => {
    const display = getSystemNexusEventDisplay(
      completedEvent({
        runId: 'target-run-id',
        started: true,
        signalLink: {
          variant: {
            case: 'workflowEvent',
            value: {
              namespace: 'target-namespace',
              workflowId: 'target-workflow-id',
              runId: 'target-run-id',
              reference: { case: 'eventRef', value: { eventId: 7n } },
            },
          },
        },
      }),
    );

    const link = display?.extraLinks?.[0];
    expect(link?.label).toBe('Target Execution');
    expect(link?.value).toBe('target-workflow-id');
    expect(link?.href).toContain('target-run-id');
  });

  it('omits the target execution link when signalLink is absent', () => {
    const display = getSystemNexusEventDisplay(
      completedEvent({ runId: 'target-run-id', started: true }),
    );
    expect(display?.extraLinks).toBeUndefined();
  });
});
