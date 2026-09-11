import {
  SignalWithStartWorkflowExecutionRequestSchema,
  SignalWithStartWorkflowExecutionResponseSchema,
} from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';
import { create, type DescMessage, toBinary } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';

import type { WorkflowEvent } from '$lib/types/events';

import {
  isSystemNexusScheduledEvent,
  resolveSystemNexusEvent,
  schemaForMessageType,
} from './index';
import { escapeQueryValue } from './shared';

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

const initiatingEvent = scheduledEvent({
  namespace: 'default',
  workflowId: 'system-nexus-workflow-id',
  signalName: 'test-signal',
});

const completedEvent = (
  init: Record<string, unknown>,
  scheduledEventId = '5',
  links?: unknown[],
) =>
  ({
    id: '6',
    name: 'NexusOperationCompleted',
    links,
    nexusOperationCompletedEventAttributes: {
      scheduledEventId,
      result: responsePayload(init),
    },
  }) as unknown as WorkflowEvent;

describe('resolveSystemNexusEvent', () => {
  it('returns null for a Nexus operation on a non-system endpoint', () => {
    const event = scheduledEvent(
      { workflowId: 'target-workflow-id' },
      'my-endpoint',
    );
    expect(resolveSystemNexusEvent(event)).toBeNull();
  });

  it('renames the scheduled event to Initiated', () => {
    const display = resolveSystemNexusEvent(
      scheduledEvent({ workflowId: 'target-workflow-id' }),
    );
    expect(display?.displayName).toBe(
      'Signal With Start Workflow Execution Initiated',
    );
  });

  it('renames the completed event to Delivered', () => {
    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }),
      { initiatingEvent },
    );
    expect(display?.displayName).toBe(
      'Signal With Start Workflow Execution Delivered',
    );
  });

  it('surfaces signalName, identity and control on the initiated event', () => {
    const display = resolveSystemNexusEvent(
      scheduledEvent({
        namespace: 'default',
        workflowId: 'target-workflow-id',
        signalName: 'test-signal',
        identity: 'test-identity',
        control: 'test-control',
      }),
    );

    expect(display?.attributes).toEqual({
      signalName: 'test-signal',
      identity: 'test-identity',
      control: 'test-control',
    });
  });

  it('omits identity and control when the request does not carry them', () => {
    const display = resolveSystemNexusEvent(
      scheduledEvent({
        workflowId: 'target-workflow-id',
        signalName: 'test-signal',
      }),
    );

    expect(display?.attributes).toEqual({ signalName: 'test-signal' });
  });

  it('links the initiated event to the target execution by workflow id', () => {
    const display = resolveSystemNexusEvent(
      scheduledEvent({
        namespace: 'target-namespace',
        workflowId: 'target-workflow-id',
      }),
    );

    const link = display?.links?.[0];
    expect(link?.label).toBe('Target Execution');
    expect(link?.value).toBe('target-workflow-id');
    expect(link?.href).toContain('target-namespace');
  });

  it('hides the raw Nexus wrapper fields', () => {
    const display = resolveSystemNexusEvent(
      scheduledEvent({ workflowId: 'target-workflow-id' }),
    );

    expect(display?.hiddenFields).toEqual(
      expect.arrayContaining(['endpoint', 'service', 'operation', 'requestId']),
    );
  });

  it('surfaces scheduledEventId as a linked Initiated Event ID', () => {
    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }, '5'),
      {
        namespace: 'default',
        workflow: 'caller-wf',
        run: 'caller-run',
        initiatingEvent,
      },
    );

    const link = display?.links?.find((l) => l.kind === 'initiated-event');
    expect(link?.label).toBe('Initiated Event ID');
    expect(link?.value).toBe('5');
    expect(link?.href).toContain('caller-wf');
    expect(link?.href).toContain('/5');
    expect(display?.hiddenFields).toContain('scheduledEventId');
  });

  it('leaves the Initiated Event ID unlinked without caller context', () => {
    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }, '5'),
      { initiatingEvent },
    );

    const link = display?.links?.find((l) => l.kind === 'initiated-event');
    expect(link?.value).toBe('5');
    expect(link?.href).toBeUndefined();
  });

  it('leads the collapsed row with the signal name on the initiated event', () => {
    const display = resolveSystemNexusEvent(
      scheduledEvent({
        workflowId: 'target-workflow-id',
        signalName: 'test-signal',
      }),
    );

    expect(display?.summaryAttribute).toEqual({
      key: 'signalName',
      value: 'test-signal',
    });
  });

  it('leaves the delivered event without a summary attribute', () => {
    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }),
      { initiatingEvent },
    );
    expect(display?.summaryAttribute).toBeUndefined();
  });

  it('links the delivered event to the exact target run from signalLink', () => {
    const display = resolveSystemNexusEvent(
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
              reference: { case: 'eventRef', value: { eventId: BigInt(7) } },
            },
          },
        },
      }),
      { initiatingEvent },
    );

    const link = display?.links?.find((l) => l.kind === 'target-execution');
    expect(link?.label).toBe('Target Execution');
    expect(link?.value).toBe('target-workflow-id');
    expect(link?.href).toContain('target-run-id');
  });

  it('omits the target execution link when signalLink is absent', () => {
    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }),
      { initiatingEvent },
    );
    expect(
      display?.links?.find((l) => l.kind === 'target-execution'),
    ).toBeUndefined();
  });

  it('falls back to event links when signalLink is present but incomplete', () => {
    // A signalLink missing workflowId cannot build a link. The event links can,
    // so the fallback must still run.
    const display = resolveSystemNexusEvent(
      completedEvent(
        {
          runId: 'target-run-id',
          started: true,
          signalLink: {
            variant: {
              case: 'workflowEvent',
              value: { namespace: 'target-namespace' },
            },
          },
        },
        '5',
        [
          {
            workflowEvent: {
              namespace: 'default',
              workflowId: 'system-nexus-workflow-id',
              runId: 'target-run-id',
              requestIdRef: { requestId: 'b580d786' },
            },
          },
        ],
      ),
      { initiatingEvent },
    );

    const link = display?.links?.find((l) => l.kind === 'target-execution');
    expect(link?.value).toBe('system-nexus-workflow-id');
  });

  it('falls back to event links when the response carries no signalLink', () => {
    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }, '5', [
        {
          workflowEvent: {
            namespace: 'default',
            workflowId: 'system-nexus-workflow-id',
            runId: 'target-run-id',
            requestIdRef: { requestId: 'b580d786' },
          },
        },
      ]),
      { initiatingEvent },
    );

    const link = display?.links?.find((l) => l.kind === 'target-execution');
    expect(link?.label).toBe('Target Execution');
    expect(link?.value).toBe('system-nexus-workflow-id');
    expect(link?.href).toContain('target-run-id');
  });
});

describe('schemaForMessageType', () => {
  it('resolves schemas for every registered operation payload', () => {
    expect(
      schemaForMessageType(
        'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest',
      ),
    ).not.toBeNull();
    expect(
      schemaForMessageType(
        'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse',
      ),
    ).not.toBeNull();
  });

  it('returns null for a message type no operation declares', () => {
    expect(schemaForMessageType('not.a.real.MessageType')).toBeNull();
  });
});

describe('escapeQueryValue', () => {
  it('escapes a quote so it cannot close the query literal', () => {
    expect(escapeQueryValue('a" or WorkflowType="b')).toBe(
      'a\\" or WorkflowType=\\"b',
    );
  });

  it('escapes a backslash before it can escape the escape', () => {
    expect(escapeQueryValue('a\\"b')).toBe('a\\\\\\"b');
  });

  it('leaves an ordinary workflow id untouched', () => {
    expect(escapeQueryValue('system-nexus-workflow-id')).toBe(
      'system-nexus-workflow-id',
    );
  });
});

describe('endpoint trust', () => {
  it('builds the target search with the quote escaped', () => {
    const display = resolveSystemNexusEvent(
      scheduledEvent({
        namespace: 'default',
        workflowId: 'a" or WorkflowType="b',
      }),
    );

    const link = display?.links?.find((l) => l.kind === 'target-execution');
    const query = decodeURIComponent(
      (link?.href ?? '').split('query=')[1] ?? '',
    );
    // Exactly the two quotes that delimit the literal.
    expect(query.match(/(?<!\\)"/g)?.length).toBe(2);
  });

  it('refuses a terminal event whose initiating event is a foreign endpoint', () => {
    const foreign = scheduledEvent(
      { workflowId: 'target-workflow-id' },
      'attacker-endpoint',
    );

    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }),
      { initiatingEvent: foreign },
    );

    expect(display).toBeNull();
  });

  it('refuses a terminal event with no initiating event to vouch for it', () => {
    const display = resolveSystemNexusEvent(
      completedEvent({ runId: 'target-run-id', started: true }),
    );

    expect(display).toBeNull();
  });
});

describe('isSystemNexusScheduledEvent', () => {
  it('accepts a scheduled event on the system endpoint', () => {
    expect(
      isSystemNexusScheduledEvent(scheduledEvent({ workflowId: 'target' })),
    ).toBe(true);
  });

  it('refuses a scheduled event on a user endpoint', () => {
    expect(
      isSystemNexusScheduledEvent(
        scheduledEvent({ workflowId: 'target' }, 'my-endpoint'),
      ),
    ).toBe(false);
  });

  it('refuses a terminal event, which carries no endpoint', () => {
    expect(
      isSystemNexusScheduledEvent(
        completedEvent({ runId: 'target-run-id', started: true }),
      ),
    ).toBe(false);
  });
});
