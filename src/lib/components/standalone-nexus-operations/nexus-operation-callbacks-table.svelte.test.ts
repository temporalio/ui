import { mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import { base } from '$app/paths';
import { page } from '$app/state';

import type { EventLink } from '$lib/types';
import type { Callback } from '$lib/types/nexus';

import NexusOperationCallbacksTable from './nexus-operation-callbacks-table.svelte';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

const workflowEventLink = {
  workflowEvent: {
    namespace: 'default',
    workflowId: 'spawned-wf',
    runId: 'spawned-run',
    eventRef: {
      eventId: '1',
      eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
    },
  },
} as unknown as EventLink;

const makeCallback = (
  state: string,
  links: EventLink[] = [],
  index = 0,
): Callback =>
  ({
    state,
    requestId: `request-${index}`,
    callback: {
      nexusHandler: {
        taskQueueName: `task-queue-${index}`,
        service: `service-${index}`,
        operation: `operation-${index}`,
      },
      links,
    },
  }) as unknown as Callback;

let cleanup: (() => void) | undefined;

const mountTable = (callbacks: Callback[]) => {
  page.url = new URL('http://localhost:3000/callbacks');
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = mount(NexusOperationCallbacksTable, {
    target,
    props: { callbacks, namespace: 'default' },
  });
  cleanup = () => {
    unmount(component);
    target.remove();
  };
  return target;
};

const rows = (target: HTMLElement) =>
  Array.from(target.querySelectorAll('[data-testid="callback-row"]'));

const cell = (row: Element, testId: string) =>
  row.querySelector(`[data-testid="${testId}"]`);

const text = (element: Element | null) => element?.textContent?.trim();

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('NexusOperationCallbacksTable', () => {
  it('renders the column headers from the design', () => {
    const target = mountTable([makeCallback('Standby')]);

    const headers = Array.from(target.querySelectorAll('thead th')).map(
      (th) => th.textContent?.trim() ?? '',
    );

    expect(headers).toEqual([
      'Delivery State',
      'Nexus Endpoint',
      'Nexus Service',
      'Nexus Operation',
      'Target Execution',
      'Target Event',
      '',
    ]);
  });

  it('shows the handler task queue under Nexus Endpoint, then the service and operation', () => {
    const target = mountTable([
      makeCallback('Standby', [], 0),
      makeCallback('Scheduled', [], 1),
    ]);

    const [first, second] = rows(target);

    expect(rows(target)).toHaveLength(2);
    expect(text(cell(first, 'callback-endpoint'))).toBe('task-queue-0');
    expect(text(cell(first, 'callback-service'))).toBe('service-0');
    expect(text(cell(second, 'callback-operation'))).toBe('operation-1');
  });

  it.each([
    ['Standby', 'Standby'],
    ['Scheduled', 'Scheduled'],
    ['BackingOff', 'Backing Off'],
    ['Failed', 'Failed'],
    ['Succeeded', 'Success'],
    ['Blocked', 'Blocked'],
  ])('shows the %s state as a %s badge', (state, label) => {
    const target = mountTable([makeCallback(state)]);

    expect(text(cell(rows(target)[0], 'callback-delivery-state'))).toBe(label);
  });

  it.each(['Standby', 'Scheduled', 'BackingOff', 'Failed', 'Blocked'])(
    'shows no target for a %s callback',
    (state) => {
      const target = mountTable([makeCallback(state, [workflowEventLink])]);
      const [row] = rows(target);

      expect(text(cell(row, 'callback-target-execution'))).toBe('');
      expect(text(cell(row, 'callback-target-event'))).toBe('');
    },
  );

  it('links a spawned workflow by its ID and names the event as plain text', () => {
    const target = mountTable([makeCallback('Succeeded', [workflowEventLink])]);
    const [row] = rows(target);
    const execution = cell(row, 'callback-target-execution');
    const event = cell(row, 'callback-target-event');

    expect(execution?.querySelector('a')?.getAttribute('href')).toBe(
      `${base}/namespaces/default/workflows/spawned-wf/spawned-run/history/events/1`,
    );
    expect(text(execution?.querySelector('a') ?? null)).toBe('spawned-wf');
    expect(execution?.textContent).toContain('Workflow Execution');
    expect(text(event)).toBe('WorkflowExecutionStarted');
    expect(event?.querySelector('a')).toBeNull();
  });

  it('labels a spawned standalone activity and shows no event', () => {
    const target = mountTable([
      makeCallback('Succeeded', [
        {
          activity: {
            namespace: 'default',
            activityId: 'spawned-activity',
            runId: 'activity-run',
          },
        },
      ]),
    ]);
    const [row] = rows(target);
    const execution = cell(row, 'callback-target-execution');

    expect(text(execution?.querySelector('a') ?? null)).toBe(
      'spawned-activity',
    );
    expect(execution?.textContent).toContain('Standalone Activity');
    expect(text(cell(row, 'callback-target-event'))).toBe('');
  });

  it('links a spawned batch job in the current namespace and shows no event', () => {
    const target = mountTable([
      makeCallback('Succeeded', [{ batchJob: { jobId: 'job-1' } }]),
    ]);
    const [row] = rows(target);
    const execution = cell(row, 'callback-target-execution');

    expect(execution?.querySelector('a')?.getAttribute('href')).toBe(
      `${base}/namespaces/default/batch-operations/job-1`,
    );
    expect(execution?.textContent).toContain('Batch Job');
    expect(text(cell(row, 'callback-target-event'))).toBe('');
  });

  it('leaves the target columns empty when a successful callback spawned nothing', () => {
    const target = mountTable([makeCallback('Succeeded')]);
    const [row] = rows(target);

    expect(text(cell(row, 'callback-target-execution'))).toBe('');
    expect(text(cell(row, 'callback-target-event'))).toBe('');
  });

  it('shows a chevron at the end of every row', () => {
    const target = mountTable([
      makeCallback('Standby', [], 0),
      makeCallback('Succeeded', [], 1),
    ]);

    for (const row of rows(target)) {
      expect(
        cell(row, 'callback-expand')?.querySelector('svg') ?? null,
      ).not.toBeNull();
    }
  });

  it('shows the empty state with a docs link and the SDK getting-started links', () => {
    const target = mountTable([]);
    const emptyState = target.querySelector(
      '[data-testid="callbacks-empty-state"]',
    );

    expect(rows(target)).toHaveLength(0);
    expect(emptyState?.textContent).toContain(
      'No callbacks attached to this Standalone Nexus Operation.',
    );
    expect(emptyState?.textContent).toContain(
      'Learn about attaching and using callbacks in Docs, or get started with your preferred SDK.',
    );
    const links = Array.from(
      emptyState?.querySelectorAll<HTMLAnchorElement>('a') ?? [],
    ).map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      'https://docs.temporal.io/nexus',
      'https://learn.temporal.io/getting_started/go/',
      'https://learn.temporal.io/getting_started/python/',
      'https://learn.temporal.io/getting_started/typescript/',
      'https://learn.temporal.io/getting_started/dotnet/',
      'https://learn.temporal.io/getting_started/ruby/',
      'https://learn.temporal.io/getting_started/java/',
      'https://docs.temporal.io/develop/rust/quickstart',
    ]);
    expect(
      emptyState?.querySelector('[data-testid="sdk-icon-swift"] svg'),
    ).not.toBeNull();
  });

  it('shows 100 of 2,000 callbacks on the first page', () => {
    const callbacks = Array.from({ length: 2000 }, (_, index) =>
      makeCallback('Standby', [], index),
    );

    const target = mountTable(callbacks);
    const visible = rows(target);

    expect(visible).toHaveLength(100);
    expect(text(cell(visible[0], 'callback-endpoint'))).toBe('task-queue-0');
    expect(text(cell(visible[99], 'callback-endpoint'))).toBe('task-queue-99');
  });
});
