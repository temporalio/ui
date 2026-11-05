import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import { base } from '$app/paths';
import { page } from '$app/state';

import { fullEventHistory } from '$lib/stores/events';
import { workflowRun } from '$lib/stores/workflow-run';
import type { WorkflowEvent } from '$lib/types/events';

import WorkflowNexusLinks from './workflow-nexus-links.svelte';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

const callerWorkflowLink = {
  workflowEvent: {
    namespace: 'caller-ns',
    workflowId: 'caller-wf',
    runId: 'caller-run',
    eventRef: {
      eventId: '5',
      eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
    },
  },
};

const callbackLink = {
  callback: {
    namespace: 'default',
    execution: {
      type: 'EXECUTION_TYPE_NEXUS_OPERATION',
      businessId: 'caller-op',
      runId: 'caller-op-run',
    },
    requestId: 'callback-request',
  },
};

const startedEvent = (links: unknown[] = []) =>
  ({
    id: '1',
    eventId: '1',
    name: 'WorkflowExecutionStarted',
    eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
    category: 'workflow',
    links,
    workflowExecutionStartedEventAttributes: {},
    attributes: {},
  }) as unknown as WorkflowEvent;

const updateAcceptedEvent = (links: unknown[] = []) =>
  ({
    id: '8',
    eventId: '8',
    name: 'WorkflowExecutionUpdateAccepted',
    eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED',
    category: 'update',
    links: [],
    workflowExecutionUpdateAcceptedEventAttributes: {
      acceptedRequest: { links },
    },
    attributes: { acceptedRequest: { links } },
  }) as unknown as WorkflowEvent;

const outboundScheduledEvent = () =>
  ({
    id: '12',
    eventId: '12',
    name: 'NexusOperationScheduled',
    eventType: 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
    category: 'nexus',
    links: [
      {
        workflowEvent: {
          namespace: 'handler-ns',
          workflowId: 'handler-wf',
          runId: 'handler-run',
          eventRef: { eventId: '1' },
        },
      },
    ],
    nexusOperationScheduledEventAttributes: {
      endpoint: 'endpoint',
      service: 'service',
      operation: 'operation',
    },
    attributes: {},
  }) as unknown as WorkflowEvent;

let component: ReturnType<typeof mount> | undefined;

const renderLinks = (events: WorkflowEvent[], search = '') => {
  page.params = {
    namespace: 'default',
    workflow: 'target-wf',
    run: 'target-run',
  };
  page.url = new URL(`http://localhost:3000/nexus-links${search}`);
  workflowRun.set({
    workflow: { pendingActivities: [], pendingNexusOperations: [] },
  } as never);
  fullEventHistory.set(events as never);
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(WorkflowNexusLinks, { target });
  flushSync();
  return target;
};

const text = (element: Element | null | undefined) =>
  element?.textContent?.trim().replace(/\s+/g, ' ');

const inboundRows = (target: HTMLElement) =>
  Array.from(target.querySelectorAll('[data-testid="inbound-link-row"]'));

const cell = (row: Element, testId: string) =>
  row.querySelector(`[data-testid="${testId}"]`);

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  fullEventHistory.set([]);
  document.body.innerHTML = '';
});

describe('WorkflowNexusLinks', () => {
  it('is titled Links', () => {
    const target = renderLinks([startedEvent([callerWorkflowLink])]);

    expect(text(target.querySelector('h2'))).toBe('Links');
  });

  it('labels the inbound columns Caller Event, Caller Execution, Caller Namespace and Target', () => {
    const target = renderLinks([startedEvent([callerWorkflowLink])]);

    const headers = Array.from(
      target.querySelectorAll('#inbound-nexus-links thead th'),
    ).map((th) => text(th));
    expect(headers).toEqual([
      'Caller Event',
      'Caller Execution',
      'Caller Namespace',
      'Target',
    ]);
  });

  it('shows a worker callback Update as an inbound row', () => {
    const target = renderLinks([
      startedEvent(),
      updateAcceptedEvent([callbackLink]),
    ]);
    const [row] = inboundRows(target);
    const callerEvent = cell(row, 'caller-event')?.querySelector('a');
    const callerExecution = cell(row, 'caller-execution');
    const targetEvent = cell(row, 'target-event')?.querySelector('a');

    expect(inboundRows(target)).toHaveLength(1);
    expect(text(callerEvent)).toBe('callback-request');
    expect(callerEvent?.getAttribute('href')).toBe(
      `${base}/namespaces/default/nexus-operations/caller-op/caller-op-run/callbacks?requestId=callback-request`,
    );
    expect(text(callerExecution?.querySelector('a'))).toBe('caller-op');
    expect(callerExecution?.querySelector('a')?.getAttribute('href')).toBe(
      `${base}/namespaces/default/nexus-operations/caller-op/caller-op-run/details`,
    );
    expect(text(callerExecution)).toContain('Standalone Nexus Operation');
    expect(text(cell(row, 'caller-namespace'))).toBe('default');
    expect(text(targetEvent)).toBe('WorkflowExecutionUpdateAccepted (8)');
    expect(targetEvent?.getAttribute('href')).toBe(
      `${base}/namespaces/default/workflows/target-wf/target-run/history/events/8`,
    );
  });

  it('lists every inbound row type in history order', () => {
    const target = renderLinks([
      startedEvent([callerWorkflowLink]),
      updateAcceptedEvent([callbackLink]),
    ]);
    const [nexusCaller, workerCallback] = inboundRows(target);

    expect(inboundRows(target)).toHaveLength(2);
    expect(text(cell(nexusCaller, 'caller-event'))).toBe(
      'NexusOperationScheduled (5)',
    );
    expect(
      text(cell(nexusCaller, 'caller-execution')?.querySelector('a')),
    ).toBe('caller-wf');
    expect(text(cell(nexusCaller, 'caller-execution'))).toContain(
      'Workflow Execution',
    );
    expect(text(cell(workerCallback, 'caller-event'))).toBe('callback-request');
  });

  it('shows the inbound empty state with SDK links when only outbound links exist', () => {
    const target = renderLinks(
      [startedEvent(), outboundScheduledEvent()],
      '?links=inbound',
    );
    const emptyState = target.querySelector(
      '[data-testid="inbound-links-empty-state"]',
    );

    expect(text(emptyState)).toContain(
      'There are no inbound links for this Workflow.',
    );
    expect(
      emptyState?.querySelector(
        'a[href="https://learn.temporal.io/getting_started/go/"]',
      ),
    ).not.toBeNull();
  });

  it('shows the outbound empty state with SDK links when only inbound links exist', () => {
    const target = renderLinks(
      [startedEvent([callerWorkflowLink])],
      '?links=outbound',
    );
    const emptyState = target.querySelector(
      '[data-testid="outbound-links-empty-state"]',
    );

    expect(text(emptyState)).toContain(
      'There are no outbound links for this Workflow.',
    );
    expect(
      emptyState?.querySelector(
        'a[href="https://docs.temporal.io/develop/rust/quickstart"]',
      ),
    ).not.toBeNull();
  });
});
