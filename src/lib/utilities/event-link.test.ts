import { describe, expect, it } from 'vitest';

import { base } from '$app/paths';

import { toEventLinkView } from './event-link';

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
      label: 'Link',
      value: 'test-wf/test-run/history/events/42',
      href: `${base}/namespaces/test-ns/workflows/test-wf/test-run/history/events/42`,
      namespace: {
        label: 'Link Namespace',
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
      label: 'Nexus Operation',
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
      label: 'Activity ID',
      value: 'activity-1',
      href: `${base}/namespaces/test-ns/activities/activity-1/run-1/details`,
    });
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
      label: 'Nexus Operation',
      value: 'operation-1',
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
