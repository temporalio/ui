import { describe, expect, it } from 'vitest';

import { base } from '$app/paths';

import { eventLinkTargetTypeLabel, toEventLinkView } from './event-link';

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

  it('returns undefined for variants without a handler target type', () => {
    expect(eventLinkTargetTypeLabel('nexusOperation')).toBeUndefined();
    expect(eventLinkTargetTypeLabel('batchJob')).toBeUndefined();
    expect(eventLinkTargetTypeLabel('unknown')).toBeUndefined();
  });
});
