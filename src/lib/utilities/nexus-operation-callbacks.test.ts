import { describe, expect, it } from 'vitest';

import { base } from '$app/paths';

import type { EventLink } from '$lib/types';
import { toEventLinkView } from '$lib/utilities/event-link';
import { routeForWorkflow } from '$lib/utilities/route-for';

import {
  callbackDeliveryState,
  callbackTargetEvent,
  callbackTargetHref,
  callbackTargetName,
  callbackTargetTypeLabel,
} from './nexus-operation-callbacks';

describe('callbackDeliveryState', () => {
  it.each([
    ['Standby', 'Standby', 'neutral'],
    ['Scheduled', 'Scheduled', 'info'],
    ['BackingOff', 'Backing Off', 'error'],
    ['Failed', 'Failed', 'danger'],
    ['Succeeded', 'Success', 'success'],
    ['Blocked', 'Blocked', 'warning'],
    ['Unspecified', 'Unspecified', 'neutral'],
  ])('maps %s to a %s badge in %s', (state, label, colorScheme) => {
    expect(callbackDeliveryState(state)).toEqual({ label, colorScheme });
  });

  it('treats a missing or unknown state as Unspecified', () => {
    expect(callbackDeliveryState(undefined)).toEqual({
      label: 'Unspecified',
      colorScheme: 'neutral',
    });
    expect(callbackDeliveryState('SomethingNew')).toEqual({
      label: 'Unspecified',
      colorScheme: 'neutral',
    });
  });
});

describe('callbackTargetTypeLabel', () => {
  it.each([
    ['workflowEvent', 'Workflow Execution'],
    ['workflow', 'Workflow Execution'],
    ['activity', 'Standalone Activity'],
    ['batchJob', 'Batch Job'],
    ['nexusOperation', 'Standalone Nexus Operation'],
  ] as const)('labels a %s target as %s', (variant, label) => {
    expect(callbackTargetTypeLabel(variant)).toBe(label);
  });

  it.each(['callback', 'unknown'] as const)(
    'has no label for a %s link',
    (variant) => {
      expect(callbackTargetTypeLabel(variant)).toBeUndefined();
    },
  );
});

describe('callbackTargetName', () => {
  const nameFor = (link: EventLink) =>
    callbackTargetName(link, toEventLinkView(link, { namespace: 'default' }));

  it('uses the workflow ID for a workflow event link', () => {
    expect(
      nameFor({
        workflowEvent: {
          namespace: 'default',
          workflowId: 'spawned-wf',
          runId: 'run-1',
          eventRef: { eventId: '1' },
        },
      } as unknown as EventLink),
    ).toBe('spawned-wf');
  });

  it('uses the workflow ID for a workflow link', () => {
    expect(
      nameFor({
        workflow: {
          namespace: 'default',
          workflowId: 'signaled-wf',
          runId: 'run-1',
        },
      }),
    ).toBe('signaled-wf');
  });

  it('falls back to the link view value for other targets', () => {
    expect(
      nameFor({
        activity: {
          namespace: 'default',
          activityId: 'spawned-activity',
          runId: 'run-1',
        },
      }),
    ).toBe('spawned-activity');
    expect(nameFor({ batchJob: { jobId: 'job-1' } })).toBe('job-1');
  });
});

const workflowEventLink = (
  ref: Record<string, unknown>,
  workflowEvent: Record<string, unknown> = {
    namespace: 'default',
    workflowId: 'wf',
    runId: 'run',
  },
) => ({ workflowEvent: { ...workflowEvent, ...ref } }) as unknown as EventLink;

describe('callbackTargetHref', () => {
  const hrefFor = (link: EventLink) =>
    callbackTargetHref(link, toEventLinkView(link, { namespace: 'default' }));

  it('links a workflow event to the workflow execution, not the event', () => {
    expect(
      hrefFor(
        workflowEventLink({
          eventRef: {
            eventId: '8',
            eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED',
          },
        }),
      ),
    ).toBe(
      routeForWorkflow({ namespace: 'default', workflow: 'wf', run: 'run' }),
    );
  });

  it('has no link for a workflow event without route fields', () => {
    expect(
      hrefFor(
        workflowEventLink({ eventRef: { eventId: '8' } }, { workflowId: 'wf' }),
      ),
    ).toBeUndefined();
  });

  it('uses the link view href for other link types', () => {
    expect(hrefFor({ batchJob: { jobId: 'job-1' } })).toBe(
      `${base}/namespaces/default/batch-operations/job-1`,
    );
  });
});

describe('callbackTargetEvent', () => {
  it('links to the event and shows its ID when the link has an event ID', () => {
    expect(
      callbackTargetEvent(
        workflowEventLink({
          eventRef: {
            eventId: '8',
            eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED',
          },
        }),
      ),
    ).toEqual({
      label: 'WorkflowExecutionUpdateAccepted (8)',
      href: `${base}/namespaces/default/workflows/wf/run/history/events/8`,
    });
  });

  it('names an event referenced by request ID without a link', () => {
    expect(
      callbackTargetEvent(
        workflowEventLink({
          requestIdRef: {
            requestId: 'req-1',
            eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED',
          },
        }),
      ),
    ).toEqual({ label: 'WorkflowExecutionUpdateAccepted' });
  });

  it('shows the event ID without a link when the route fields are missing', () => {
    expect(
      callbackTargetEvent(
        workflowEventLink(
          {
            eventRef: {
              eventId: '1',
              eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
            },
          },
          { workflowId: 'wf' },
        ),
      ),
    ).toEqual({ label: 'WorkflowExecutionStarted (1)' });
  });

  it('has no event for workflow, activity and batch job links', () => {
    expect(
      callbackTargetEvent({ workflow: { workflowId: 'wf' } }),
    ).toBeUndefined();
    expect(
      callbackTargetEvent({ activity: { activityId: 'a' } }),
    ).toBeUndefined();
    expect(callbackTargetEvent({ batchJob: { jobId: 'j' } })).toBeUndefined();
  });
});
