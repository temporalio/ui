import { describe, expect, it } from 'vitest';

import { base } from '$app/paths';

import type { EventLink } from '$lib/types';

import { toInboundLinkRow } from './inbound-link-row';

const callbackLink = (
  type: string,
  overrides: Record<string, unknown> = {},
): EventLink =>
  ({
    callback: {
      namespace: 'caller-ns',
      execution: { type, businessId: 'caller-id', runId: 'caller-run' },
      requestId: 'callback-request',
      ...overrides,
    },
  }) as unknown as EventLink;

describe('toInboundLinkRow', () => {
  it('shows a Nexus operation caller workflow by its event and workflow ID', () => {
    const row = toInboundLinkRow({
      workflowEvent: {
        namespace: 'caller-ns',
        workflowId: 'caller-wf',
        runId: 'caller-run',
        eventRef: {
          eventId: '5',
          eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
        },
      },
    } as unknown as EventLink);

    expect(row.callerEvent).toEqual({
      label: 'Caller Event',
      value: 'NexusOperationScheduled (5)',
      href: `${base}/namespaces/caller-ns/workflows/caller-wf/caller-run/history/events/5`,
    });
    expect(row.callerExecution).toEqual({
      value: 'caller-wf',
      href: `${base}/namespaces/caller-ns/workflows/caller-wf/caller-run/timeline`,
      typeLabel: 'Workflow Execution',
    });
    expect(row.callerNamespace).toMatchObject({
      value: 'caller-ns',
      href: `${base}/namespaces/caller-ns`,
    });
  });

  it('names a system Nexus caller event by its operation', () => {
    const row = toInboundLinkRow(
      {
        workflowEvent: {
          namespace: 'caller-ns',
          workflowId: 'caller-wf',
          runId: 'caller-run',
          eventRef: {
            eventId: '5',
            eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
          },
        },
      } as unknown as EventLink,
      undefined,
      'SignalWithStartWorkflowExecution',
    );

    expect(row.callerEvent).toEqual({
      label: 'Caller Event',
      value: 'SignalWithStartWorkflowExecution',
      href: `${base}/namespaces/caller-ns/workflows/caller-wf/caller-run/history/events/5`,
    });
  });

  it('shows a workflow link by its workflow ID with no caller event', () => {
    const row = toInboundLinkRow({
      workflow: {
        namespace: 'caller-ns',
        workflowId: 'caller-wf',
        runId: 'caller-run',
      },
    });

    expect(row.callerEvent).toBeUndefined();
    expect(row.callerExecution).toEqual({
      value: 'caller-wf',
      href: `${base}/namespaces/caller-ns/workflows/caller-wf/caller-run/timeline`,
      typeLabel: 'Workflow Execution',
    });
  });

  it('shows a standalone Nexus operation caller by its operation ID with no caller event', () => {
    const row = toInboundLinkRow({
      nexusOperation: {
        namespace: 'caller-ns',
        operationId: 'caller-op',
        runId: 'caller-run',
      },
    });

    expect(row.callerEvent).toBeUndefined();
    expect(row.callerExecution).toEqual({
      value: 'caller-op',
      href: `${base}/namespaces/caller-ns/nexus-operations/caller-op/caller-run/details`,
      typeLabel: 'Standalone Nexus Operation',
    });
  });

  it('links a worker callback’s request ID to the operation’s Callbacks row', () => {
    const row = toInboundLinkRow(
      callbackLink('EXECUTION_TYPE_NEXUS_OPERATION'),
    );

    expect(row.callerEvent).toEqual({
      label: 'Caller Event',
      value: 'callback-request',
      href: `${base}/namespaces/caller-ns/nexus-operations/caller-id/caller-run/callbacks?requestId=callback-request`,
    });
    expect(row.callerExecution).toEqual({
      value: 'caller-id',
      href: `${base}/namespaces/caller-ns/nexus-operations/caller-id/caller-run/details`,
      typeLabel: 'Standalone Nexus Operation',
    });
    expect(row.callerNamespace).toMatchObject({ value: 'caller-ns' });
  });

  it('shows a worker callback from a workflow as a workflow execution', () => {
    const row = toInboundLinkRow(callbackLink('EXECUTION_TYPE_WORKFLOW'));

    expect(row.callerExecution).toEqual({
      value: 'caller-id',
      href: `${base}/namespaces/caller-ns/workflows/caller-id/caller-run/timeline`,
      typeLabel: 'Workflow Execution',
    });
  });

  it('shows a worker callback from a standalone activity as a standalone activity', () => {
    const row = toInboundLinkRow(callbackLink('EXECUTION_TYPE_ACTIVITY'));

    expect(row.callerExecution).toEqual({
      value: 'caller-id',
      href: `${base}/namespaces/caller-ns/activities/caller-id/caller-run/details`,
      typeLabel: 'Standalone Activity',
    });
  });

  it('has no caller event for a worker callback without a request ID', () => {
    const row = toInboundLinkRow(
      callbackLink('EXECUTION_TYPE_NEXUS_OPERATION', { requestId: '' }),
    );

    expect(row.callerEvent).toBeUndefined();
  });

  it('shows the caller execution as text when the run ID is missing', () => {
    const row = toInboundLinkRow({
      callback: {
        namespace: 'caller-ns',
        execution: {
          type: 'EXECUTION_TYPE_NEXUS_OPERATION',
          businessId: 'caller-id',
        },
        requestId: 'callback-request',
      },
    } as unknown as EventLink);

    expect(row.callerExecution).toEqual({
      value: 'caller-id',
      href: undefined,
      typeLabel: 'Standalone Nexus Operation',
    });
    expect(row.callerEvent?.href).toBeUndefined();
  });

  it('returns an empty row for a missing link', () => {
    expect(toInboundLinkRow(undefined)).toEqual({});
  });
});
