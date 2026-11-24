import { flushSync, mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { base } from '$app/paths';
import { page } from '$app/state';

import type { EventLink } from '$lib/types';
import type { Callback } from '$lib/types/nexus';
import { routeForWorkflow } from '$lib/utilities/route-for';

import NexusOperationCallbacksTable from './nexus-operation-callbacks-table.svelte';

vi.mock('$app/navigation', async (importOriginal) => {
  const original = await importOriginal<typeof import('$app/navigation')>();
  const { page } = await import('$app/state');
  return {
    ...original,
    goto: vi.fn(async (url: string | URL) => {
      page.url = new URL(String(url), page.url);
    }),
  };
});

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

const mountTable = (callbacks: Callback[], search = '') => {
  page.url = new URL(`http://localhost:3000/callbacks${search}`);
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
      'Task Queue',
      'Nexus Service',
      'Nexus Operation',
      'Target Execution',
      'Target Event',
      '',
    ]);
  });

  it('shows the handler task queue under Task Queue, then the service and operation', () => {
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

  it('links a spawned workflow to its execution and the target event to the event', () => {
    const target = mountTable([makeCallback('Succeeded', [workflowEventLink])]);
    const [row] = rows(target);
    const execution = cell(row, 'callback-target-execution');
    const event = cell(row, 'callback-target-event');

    expect(execution?.querySelector('a')?.getAttribute('href')).toBe(
      routeForWorkflow({
        namespace: 'default',
        workflow: 'spawned-wf',
        run: 'spawned-run',
      }),
    );
    expect(text(execution?.querySelector('a') ?? null)).toBe('spawned-wf');
    expect(execution?.textContent).toContain('Workflow Execution');
    expect(event?.querySelector('a')?.getAttribute('href')).toBe(
      `${base}/namespaces/default/workflows/spawned-wf/spawned-run/history/events/1`,
    );
    expect(text(event?.querySelector('a') ?? null)).toBe(
      'WorkflowExecutionStarted (1)',
    );
  });

  it('names the target event as plain text when the link has no event ID', () => {
    const target = mountTable([
      makeCallback('Succeeded', [
        {
          workflowEvent: {
            namespace: 'default',
            workflowId: 'spawned-wf',
            runId: 'spawned-run',
            requestIdRef: {
              requestId: 'req-1',
              eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_UPDATE_ACCEPTED',
            },
          },
        } as unknown as EventLink,
      ]),
    ]);
    const event = cell(rows(target)[0], 'callback-target-event');

    expect(text(event)).toBe('WorkflowExecutionUpdateAccepted');
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

describe('NexusOperationCallbacksTable expanded details', () => {
  const detailedCallback = (
    overrides: Record<string, unknown> = {},
    index = 0,
  ): Callback =>
    ({
      ...makeCallback('BackingOff', [], index),
      registrationTime: '2026-11-05T16:50:49Z',
      attempt: 3,
      lastAttemptCompleteTime: '2026-11-05T16:51:00Z',
      nextAttemptScheduleTime: '2026-11-05T16:52:00Z',
      blockedReason: 'circuit breaker open',
      lastAttemptFailure: { message: 'handler unavailable' },
      ...overrides,
    }) as unknown as Callback;

  const expandButton = (row: Element) =>
    cell(row, 'callback-expand')?.querySelector('button') ?? null;

  const details = (target: HTMLElement) =>
    target.querySelector('[data-testid="callback-details"]');

  const field = (target: HTMLElement, name: string) =>
    text(target.querySelector(`[data-testid="callback-detail-${name}"]`));

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('starts collapsed with an expand button', () => {
    const target = mountTable([detailedCallback()]);
    const button = expandButton(rows(target)[0]);

    expect(details(target)).toBeNull();
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(button?.getAttribute('aria-label')).toBe('Expand details');
  });

  it('expands and collapses the delivery details from the chevron', () => {
    const target = mountTable([detailedCallback()]);
    const button = expandButton(rows(target)[0]);

    button?.click();
    flushSync();

    const detailsRow = details(target)?.closest('tr');
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    expect(button?.getAttribute('aria-label')).toBe('Collapse details');
    expect(detailsRow?.id).toBe(button?.getAttribute('aria-controls'));
    expect(detailsRow?.querySelector('td')?.getAttribute('colspan')).toBe('7');

    button?.click();
    flushSync();

    expect(details(target)).toBeNull();
    expect(button?.getAttribute('aria-expanded')).toBe('false');
  });

  it('expands and collapses when any part of the row is clicked', () => {
    const target = mountTable([detailedCallback()]);
    const [row] = rows(target);

    expect(row.classList.contains('hover:cursor-pointer')).toBe(true);

    (cell(row, 'callback-service') as HTMLElement).click();
    flushSync();

    expect(details(target)).not.toBeNull();
    expect(expandButton(row)?.getAttribute('aria-expanded')).toBe('true');

    (cell(row, 'callback-operation') as HTMLElement).click();
    flushSync();

    expect(details(target)).toBeNull();
  });

  it('toggles once when the chevron inside the clickable row is clicked', () => {
    const target = mountTable([detailedCallback()]);
    const button = expandButton(rows(target)[0]);

    button?.click();
    flushSync();

    expect(details(target)).not.toBeNull();
    expect(button?.getAttribute('aria-expanded')).toBe('true');
  });

  it('follows a target link without expanding the row', () => {
    const target = mountTable([
      detailedCallback({
        state: 'Succeeded',
        callback: makeCallback('Succeeded', [workflowEventLink]).callback,
      }),
    ]);
    const link =
      cell(rows(target)[0], 'callback-target-execution')?.querySelector('a') ??
      null;

    expect(link).not.toBeNull();
    link?.click();
    flushSync();

    expect(details(target)).toBeNull();
  });

  it('follows a target event link without expanding the row', () => {
    const target = mountTable([
      detailedCallback({
        state: 'Succeeded',
        callback: makeCallback('Succeeded', [workflowEventLink]).callback,
      }),
    ]);
    const link =
      cell(rows(target)[0], 'callback-target-event')?.querySelector('a') ??
      null;

    expect(link).not.toBeNull();
    link?.click();
    flushSync();

    expect(details(target)).toBeNull();
  });

  it('shows every delivery field', () => {
    const target = mountTable([detailedCallback()]);
    expandButton(rows(target)[0])?.click();
    flushSync();

    expect(field(target, 'request-id')).toBe('request-0');
    expect(field(target, 'registration-time')).toContain('2026');
    expect(field(target, 'attempt')).toBe('3');
    expect(field(target, 'last-attempt-complete-time')).toContain('2026');
    expect(field(target, 'next-attempt-schedule-time')).toContain('2026');
    expect(field(target, 'blocked-reason')).toBe('circuit breaker open');
  });

  it('shows a hyphen for every field without a value', () => {
    const target = mountTable([
      detailedCallback({
        requestId: undefined,
        registrationTime: undefined,
        attempt: 0,
        lastAttemptCompleteTime: undefined,
        nextAttemptScheduleTime: undefined,
        blockedReason: undefined,
      }),
    ]);
    expandButton(rows(target)[0])?.click();
    flushSync();

    for (const name of [
      'request-id',
      'registration-time',
      'attempt',
      'last-attempt-complete-time',
      'next-attempt-schedule-time',
      'blocked-reason',
    ]) {
      expect(field(target, name)).toBe('-');
    }
  });

  it('shows the last attempt failure beside the fields', () => {
    const target = mountTable([detailedCallback()]);
    expandButton(rows(target)[0])?.click();
    flushSync();

    const failure = target.querySelector(
      '[data-testid="callback-detail-last-attempt-failure"]',
    );
    expect(failure?.textContent).toContain('Last Attempt Failure');
    expect(failure?.textContent).toContain('handler unavailable');
  });

  it('leaves out the failure block when there is no failure', () => {
    const target = mountTable([
      detailedCallback({ lastAttemptFailure: undefined }),
    ]);
    expandButton(rows(target)[0])?.click();
    flushSync();

    expect(
      target.querySelector(
        '[data-testid="callback-detail-last-attempt-failure"]',
      ),
    ).toBeNull();
    expect(details(target)?.textContent).not.toContain('Last Attempt Failure');
  });

  it('expands and scrolls to the callback named in ?requestId', async () => {
    const target = mountTable(
      [detailedCallback({}, 0), detailedCallback({}, 1)],
      '?requestId=request-1',
    );
    await tick();
    flushSync();

    expect(field(target, 'request-id')).toBe('request-1');
    expect(expandButton(rows(target)[1])?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(expandButton(rows(target)[0])?.getAttribute('aria-expanded')).toBe(
      'false',
    );
    await vi.waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
  });

  it('moves to the page holding the ?requestId callback before expanding it', async () => {
    const { goto } = await import('$app/navigation');
    const callbacks = Array.from({ length: 150 }, (_, index) =>
      detailedCallback({}, index),
    );

    mountTable(callbacks, '?requestId=request-120');
    await vi.waitFor(() =>
      expect(goto).toHaveBeenCalledWith(
        expect.stringContaining('callbacks-page=2'),
        expect.anything(),
      ),
    );

    const navigatedSearch = page.url.search;
    cleanup?.();
    const target = mountTable(callbacks, navigatedSearch);
    await tick();
    flushSync();

    expect(text(cell(rows(target)[0], 'callback-endpoint'))).toBe(
      'task-queue-100',
    );
    expect(field(target, 'request-id')).toBe('request-120');
    await vi.waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
  });

  it('expands nothing when ?requestId matches no callback', async () => {
    const target = mountTable([detailedCallback()], '?requestId=missing');
    await tick();
    flushSync();

    expect(details(target)).toBeNull();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
