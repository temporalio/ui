import { describe, expect, it } from 'vitest';

import { base } from '$app/paths';

import {
  eventLinkTargetTypeLabel,
  toEventLinkView,
  toEventLinkViews,
} from './event-link';

describe('toEventLinkView', () => {
  it('returns a workflow event route for event references', () => {
    const view = toEventLinkView({
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
        eventRef: {
          eventId: '42',
          eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
        },
      },
    });

    expect(view).toMatchObject({
      variant: 'workflowEvent',
      label: 'Workflow Link',
      value: 'test-wf/test-run/history/events/42',
      href: `${base}/namespaces/test-ns/workflows/test-wf/test-run/history/events/42`,
      namespace: {
        label: 'Namespace Link',
        value: 'test-ns',
        href: `${base}/namespaces/test-ns`,
      },
      event: {
        label: 'Handler Event',
        value: 'NexusOperationScheduled (42)',
        href: `${base}/namespaces/test-ns/workflows/test-wf/test-run/history/events/42`,
      },
    });
  });

  it('uses caller labels for workflow events in the caller perspective', () => {
    const view = toEventLinkView(
      {
        workflowEvent: {
          namespace: 'caller-ns',
          workflowId: 'caller-wf',
          runId: 'caller-run',
          eventRef: {
            eventId: '7',
            eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
          },
        },
      },
      { perspective: 'caller' },
    );

    expect(view.label).toBe('Caller Workflow');
    expect(view.namespace?.label).toBe('Caller Namespace');
    expect(view.event?.label).toBe('Caller Event');
    expect(view.event?.href).toBe(
      `${base}/namespaces/caller-ns/workflows/caller-wf/caller-run/history/events/7`,
    );
  });

  it('returns a workflow event route for request ID references', () => {
    const view = toEventLinkView({
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
        requestIdRef: {
          requestId: 'req-123',
          eventType: 'EVENT_TYPE_NEXUS_OPERATION_COMPLETED',
        },
      },
    });

    expect(view.href).toBe(
      `${base}/namespaces/test-ns/workflows/test-wf/test-run/history/events/req-123`,
    );
    expect(view.event?.value).toBe('NexusOperationCompleted req-123');
  });

  it('returns a workflow route fallback when no event reference exists', () => {
    const view = toEventLinkView({
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
      },
    });

    expect(view).toMatchObject({
      variant: 'workflowEvent',
      value: 'test-wf/test-run/timeline',
      href: `${base}/namespaces/test-ns/workflows/test-wf/test-run/timeline`,
    });
    expect(view.event).toBeUndefined();
  });

  it('returns a workflow route for workflow links', () => {
    const view = toEventLinkView({
      workflow: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
        reason: 'query',
      },
    });

    expect(view).toMatchObject({
      variant: 'workflow',
      label: 'Workflow Link',
      value: 'test-wf/test-run/timeline',
      href: `${base}/namespaces/test-ns/workflows/test-wf/test-run/timeline`,
      namespace: {
        label: 'Namespace Link',
        value: 'test-ns',
        href: `${base}/namespaces/test-ns`,
      },
    });
    expect(view.event).toBeUndefined();
  });

  it('returns a standalone Nexus operation route', () => {
    const view = toEventLinkView({
      nexusOperation: {
        namespace: 'test-ns',
        operationId: 'operation-1',
        runId: 'run-1',
      },
    });

    expect(view).toMatchObject({
      variant: 'nexusOperation',
      label: 'Standalone Nexus Operation Link',
      value: 'operation-1',
      href: `${base}/namespaces/test-ns/nexus-operations/operation-1/run-1/details`,
    });
  });

  it('uses caller labels for a Nexus operation in the caller perspective', () => {
    const view = toEventLinkView(
      {
        nexusOperation: {
          namespace: 'caller-ns',
          operationId: 'operation-1',
          runId: 'run-1',
        },
      },
      { perspective: 'caller' },
    );

    expect(view).toMatchObject({
      variant: 'nexusOperation',
      label: 'Caller Event',
      value: 'operation-1',
      href: `${base}/namespaces/caller-ns/nexus-operations/operation-1/run-1/details`,
      namespace: {
        label: 'Caller Namespace',
        value: 'caller-ns',
        href: `${base}/namespaces/caller-ns`,
      },
    });
  });

  it('returns a standalone activity route', () => {
    const view = toEventLinkView({
      activity: {
        namespace: 'test-ns',
        activityId: 'activity-1',
        runId: 'run-1',
      },
    });

    expect(view).toMatchObject({
      variant: 'activity',
      label: 'Standalone Activity Link',
      value: 'activity-1',
      href: `${base}/namespaces/test-ns/activities/activity-1/run-1/details`,
      namespace: {
        label: 'Namespace Link',
        value: 'test-ns',
        href: `${base}/namespaces/test-ns`,
      },
    });
    expect(eventLinkTargetTypeLabel(view.variant)).toBe('Standalone Activity');
  });

  it('returns a batch operation route when namespace context is available', () => {
    const view = toEventLinkView(
      {
        batchJob: {
          jobId: 'job-1',
        },
      },
      { namespace: 'test-ns' },
    );

    expect(view).toMatchObject({
      variant: 'batchJob',
      label: 'Job ID',
      value: 'job-1',
      href: `${base}/namespaces/test-ns/batch-operations/job-1`,
    });
  });

  it('returns a text-only view for malformed links', () => {
    const view = toEventLinkView({
      nexusOperation: {
        operationId: 'operation-1',
      },
    });

    expect(view).toMatchObject({
      variant: 'nexusOperation',
      label: 'Standalone Nexus Operation Link',
      value: 'operation-1',
      href: undefined,
    });
  });

  it('returns a text-only view for malformed workflow links', () => {
    const view = toEventLinkView({
      workflow: {
        workflowId: 'test-wf',
      },
    });

    expect(view).toMatchObject({
      variant: 'workflow',
      label: 'Workflow Link',
      value: 'test-wf',
      href: undefined,
    });
  });

  describe('callback links', () => {
    const callbackLink = (
      type: string,
      overrides: Record<string, unknown> = {},
    ) => ({
      callback: {
        namespace: 'source-ns',
        execution: {
          type: type as 'EXECUTION_TYPE_NEXUS_OPERATION',
          businessId: 'source-id',
          runId: 'source-run',
        },
        requestId: 'callback-request',
        ...overrides,
      },
    });

    it('routes a Nexus operation source to its Links › Callbacks tab', () => {
      const view = toEventLinkView(
        callbackLink('EXECUTION_TYPE_NEXUS_OPERATION'),
      );

      expect(view).toMatchObject({
        variant: 'callback',
        label: 'Callback Link',
        value: 'source-id',
        href: `${base}/namespaces/source-ns/nexus-operations/source-id/source-run/links?tab=callbacks&requestId=callback-request`,
        namespace: {
          label: 'Namespace Link',
          value: 'source-ns',
          href: `${base}/namespaces/source-ns`,
        },
      });
    });

    it('routes a standalone activity source to its Links › Callbacks tab', () => {
      const view = toEventLinkView(callbackLink('EXECUTION_TYPE_ACTIVITY'));

      expect(view.href).toBe(
        `${base}/namespaces/source-ns/activities/source-id/source-run/links?tab=callbacks&requestId=callback-request`,
      );
    });

    it('routes a workflow source to the workflow', () => {
      const view = toEventLinkView(callbackLink('EXECUTION_TYPE_WORKFLOW'));

      expect(view.href).toBe(
        `${base}/namespaces/source-ns/workflows/source-id/source-run/timeline?requestId=callback-request`,
      );
    });

    it('adds the update ID when a workflow callback comes from an update', () => {
      const view = toEventLinkView(
        callbackLink('EXECUTION_TYPE_WORKFLOW', {
          componentPath: ['Update', 'update-1'],
        }),
      );

      expect(view.href).toBe(
        `${base}/namespaces/source-ns/workflows/source-id/source-run/timeline?requestId=callback-request&updateId=update-1`,
      );
    });

    it('ignores component paths that are not updates', () => {
      const view = toEventLinkView(
        callbackLink('EXECUTION_TYPE_WORKFLOW', {
          componentPath: ['Signal', 'signal-1'],
        }),
      );

      expect(view.href).toBe(
        `${base}/namespaces/source-ns/workflows/source-id/source-run/timeline?requestId=callback-request`,
      );
    });

    it('leaves out the request ID when the link has none', () => {
      const view = toEventLinkView(
        callbackLink('EXECUTION_TYPE_NEXUS_OPERATION', { requestId: '' }),
      );

      expect(view.href).toBe(
        `${base}/namespaces/source-ns/nexus-operations/source-id/source-run/links?tab=callbacks`,
      );
    });

    it('returns a text-only view for an unknown execution type', () => {
      const view = toEventLinkView(callbackLink('EXECUTION_TYPE_UNSPECIFIED'));

      expect(view).toMatchObject({
        variant: 'callback',
        label: 'Callback Link',
        value: 'source-id',
        href: undefined,
      });
    });

    it('returns a text-only view when the run ID is missing', () => {
      const view = toEventLinkView({
        callback: {
          namespace: 'source-ns',
          execution: {
            type: 'EXECUTION_TYPE_NEXUS_OPERATION',
            businessId: 'source-id',
          },
        },
      });

      expect(view).toMatchObject({
        variant: 'callback',
        value: 'source-id',
        href: undefined,
      });
    });

    it('builds distinct keys for callbacks with different request IDs', () => {
      const [first, second] = toEventLinkViews([
        callbackLink('EXECUTION_TYPE_NEXUS_OPERATION'),
        callbackLink('EXECUTION_TYPE_NEXUS_OPERATION', {
          requestId: 'other-request',
        }),
      ]);

      expect(first.key).not.toBe(second.key);
    });
  });

  it('returns a text-only unknown view for empty links', () => {
    const view = toEventLinkView({});

    expect(view).toMatchObject({
      variant: 'unknown',
      label: 'Link',
      value: 'Link',
    });
    expect(view.href).toBeUndefined();
  });
});

describe('eventLinkTargetTypeLabel', () => {
  it('labels an activity variant as a Standalone Activity', () => {
    expect(eventLinkTargetTypeLabel('activity')).toBe('Standalone Activity');
  });

  it('labels workflow variants as Workflow', () => {
    expect(eventLinkTargetTypeLabel('workflowEvent')).toBe('Workflow');
    expect(eventLinkTargetTypeLabel('workflow')).toBe('Workflow');
  });

  it('labels a callback variant as a Callback', () => {
    expect(eventLinkTargetTypeLabel('callback')).toBe('Callback');
  });

  it('returns undefined for variants without a handler target type', () => {
    expect(eventLinkTargetTypeLabel('nexusOperation')).toBeUndefined();
    expect(eventLinkTargetTypeLabel('batchJob')).toBeUndefined();
    expect(eventLinkTargetTypeLabel('unknown')).toBeUndefined();
  });
});
