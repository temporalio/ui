import {
  SignalWithStartWorkflowExecutionRequestSchema,
  SignalWithStartWorkflowExecutionResponseSchema,
} from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';
import { create, type DescMessage, toBinary } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';

import { base } from '$app/paths';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { EventLink } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';
import { routeForWorkflow } from '$lib/utilities/route-for';

import { outboundLinkRows, toOutboundLinkRow } from './outbound-link-row';

const context = { namespace: 'default', workflow: 'caller-wf', run: 'run-1' };

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

const scheduledEvent = (
  endpoint: string,
  operation: string,
  input?: unknown,
): WorkflowEvent =>
  ({
    id: '5',
    name: 'NexusOperationScheduled',
    eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
    nexusOperationScheduledEventAttributes: {
      endpoint,
      service: 'service',
      operation,
      input,
    },
  }) as unknown as WorkflowEvent;

const group = (
  eventList: WorkflowEvent[],
  links: EventLink[] = [],
): EventGroup => ({ id: '5', eventList, links }) as unknown as EventGroup;

const workflowEventLink = {
  workflowEvent: {
    namespace: 'handler-ns',
    workflowId: 'handler-wf',
    runId: 'handler-run',
    eventRef: {
      eventId: '1',
      eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
    },
  },
} as unknown as EventLink;

describe('toOutboundLinkRow', () => {
  it('describes a Nexus operation that started a workflow', () => {
    const row = toOutboundLinkRow(
      group(
        [scheduledEvent('my-endpoint', 'start-workflow')],
        [workflowEventLink],
      ),
      context,
    );

    expect(row).toEqual({
      sourceEvent: {
        value: '5',
        href: `${base}/namespaces/default/workflows/caller-wf/run-1/history/events/5`,
      },
      eventType: 'NexusOperationScheduled',
      targetNamespace: {
        value: 'handler-ns',
        href: `${base}/namespaces/handler-ns`,
      },
      targetExecution: {
        value: 'handler-wf',
        href: routeForWorkflow({
          namespace: 'handler-ns',
          workflow: 'handler-wf',
          run: 'handler-run',
        }),
        typeLabel: 'Workflow Execution',
      },
      targetEvent: {
        label: 'WorkflowExecutionStarted (1)',
        href: `${base}/namespaces/handler-ns/workflows/handler-wf/handler-run/history/events/1`,
      },
    });
  });

  it('describes a Nexus operation that started a standalone activity, with no target event', () => {
    const row = toOutboundLinkRow(
      group(
        [scheduledEvent('my-endpoint', 'start-activity')],
        [
          {
            activity: {
              namespace: 'handler-ns',
              activityId: 'handler-activity',
              runId: 'activity-run',
            },
          } as unknown as EventLink,
        ],
      ),
      context,
    );

    expect(row?.eventType).toBe('NexusOperationScheduled');
    expect(row?.targetExecution).toEqual({
      value: 'handler-activity',
      href: `${base}/namespaces/handler-ns/activities/handler-activity/activity-run/details`,
      typeLabel: 'Standalone Activity',
    });
    expect(row?.targetEvent).toBeUndefined();
  });

  it('describes a system Nexus operation by its operation name and its decoded target', () => {
    const scheduled = scheduledEvent(
      '__temporal_system',
      'SignalWithStartWorkflowExecution',
      toBinaryPayload(
        SignalWithStartWorkflowExecutionRequestSchema,
        create(SignalWithStartWorkflowExecutionRequestSchema, {
          namespace: 'default',
          workflowId: 'target-wf',
          signalName: 'go',
        }),
        'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest',
      ),
    );
    const completed = {
      id: '6',
      name: 'NexusOperationCompleted',
      eventType: 'EVENT_TYPE_NEXUS_OPERATION_COMPLETED',
      nexusOperationCompletedEventAttributes: {
        scheduledEventId: '5',
        result: toBinaryPayload(
          SignalWithStartWorkflowExecutionResponseSchema,
          create(SignalWithStartWorkflowExecutionResponseSchema, {
            runId: 'target-run',
            signalLink: {
              variant: {
                case: 'workflowEvent',
                value: {
                  namespace: 'default',
                  workflowId: 'target-wf',
                  runId: 'target-run',
                },
              },
            },
          }),
          'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse',
        ),
      },
    } as unknown as WorkflowEvent;

    const row = toOutboundLinkRow(group([scheduled, completed]), context);

    expect(row?.eventType).toBe('SignalWithStartWorkflowExecution');
    expect(row?.targetNamespace?.value).toBe('default');
    expect(row?.targetExecution?.value).toBe('target-wf');
    expect(row?.targetExecution?.href).toBe(
      routeForWorkflow({
        namespace: 'default',
        workflow: 'target-wf',
        run: 'target-run',
      }),
    );
  });

  it('has no row for a system Nexus operation that has not completed', () => {
    expect(
      toOutboundLinkRow(
        group([
          scheduledEvent(
            '__temporal_system',
            'SignalWithStartWorkflowExecution',
          ),
        ]),
        context,
      ),
    ).toBeNull();
  });

  it('has no row for a Nexus operation without a link', () => {
    expect(
      toOutboundLinkRow(
        group([scheduledEvent('my-endpoint', 'start-workflow')]),
        context,
      ),
    ).toBeNull();
  });
});

describe('outboundLinkRows', () => {
  const nexusEvent = (
    id: string,
    endpoint: string,
    links: EventLink[] = [],
  ): WorkflowEvent =>
    ({
      ...scheduledEvent(endpoint, 'operation'),
      id,
      eventId: id,
      category: 'nexus',
      links,
      attributes: {},
    }) as unknown as WorkflowEvent;

  it('has one row per linked Nexus operation, however many links it carries', () => {
    const rows = outboundLinkRows(
      [
        nexusEvent('5', 'my-endpoint', [workflowEventLink, workflowEventLink]),
        nexusEvent('9', 'my-endpoint'),
      ],
      context,
    );

    expect(rows.map((row) => row.sourceEvent.value)).toEqual(['5']);
  });
});
