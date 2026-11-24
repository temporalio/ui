import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { page } from '$app/state';

import type { Callback } from '$lib/types/nexus';
import type { NexusOperationExecution } from '$lib/types/nexus-operation-execution';
import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

import { MOCK_NEXUS_OPERATION } from '../../../tests/test-utilities/mocks/nexus-operations';

import StandaloneNexusOperationCallbacks from './standalone-nexus-operation-callbacks.svelte';

vi.mock('$app/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('$app/navigation')>()),
  goto: vi.fn(),
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

let component: ReturnType<typeof mount> | undefined;

const callback = (index: number): Callback =>
  ({
    state: 'Standby',
    requestId: `request-${index}`,
    callback: {
      nexusHandler: {
        taskQueueName: `task-queue-${index}`,
        service: 'service',
        operation: 'operation',
      },
    },
  }) as unknown as Callback;

const renderCallbacks = (completionCallbacks?: Callback[], search = '') => {
  page.url = new URL(`http://localhost:3000/callbacks${search}`);
  nexusOperationExecution.set({
    ...MOCK_NEXUS_OPERATION,
    completionCallbacks,
  } as unknown as NexusOperationExecution);
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(StandaloneNexusOperationCallbacks, {
    target,
    props: { namespace: 'default' },
  });
  flushSync();
  return target;
};

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', ResizeObserverStub);
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: () => ({ cancel() {} }) as Animation,
  });
});

afterEach(() => {
  delete (Element.prototype as { animate?: unknown }).animate;
  vi.unstubAllGlobals();
  if (component) unmount(component);
  component = undefined;
  nexusOperationExecution.set(undefined);
  document.body.innerHTML = '';
});

describe('StandaloneNexusOperationCallbacks', () => {
  it('shows the Callbacks heading and intro', () => {
    const target = renderCallbacks([callback(0)]);

    expect(target.querySelector('h2')?.textContent?.trim()).toBe('Callbacks');
    expect(target.textContent).toContain(
      'Callbacks allow you to dispatch this Standalone Nexus Operation’s result to a worker to trigger follow-on actions in this Namespace.',
    );
    expect(target.textContent).not.toContain('Learn more');
  });

  it('lists the operation’s completion callbacks', () => {
    const target = renderCallbacks([callback(0), callback(1)]);

    const rows = target.querySelectorAll('[data-testid="callback-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[1].textContent).toContain('task-queue-1');
  });

  it('shows the empty state when the operation has no callbacks', () => {
    const target = renderCallbacks(undefined);

    expect(
      target.querySelector('[data-testid="callbacks-empty-state"]'),
    ).not.toBeNull();
  });
});

describe('StandaloneNexusOperationCallbacks filter', () => {
  const handlerCallback = (
    index: number,
    taskQueueName: string,
    service: string,
    operation: string,
    state = 'Standby',
    links: unknown[] = [],
  ): Callback =>
    ({
      state,
      requestId: `request-${index}`,
      callback: { nexusHandler: { taskQueueName, service, operation }, links },
    }) as unknown as Callback;

  const callbacks = [
    handlerCallback(0, 'orders-tq', 'order-service', 'start-workflow'),
    handlerCallback(
      1,
      'orders-tq',
      'order-service',
      'update-workflow',
      'Failed',
    ),
    handlerCallback(
      2,
      'billing-tq',
      'billing-service',
      'start-workflow',
      'Succeeded',
      [
        {
          workflowEvent: { namespace: 'default', workflowId: 'wf', runId: 'r' },
        },
      ],
    ),
  ];

  const rows = (target: HTMLElement) =>
    Array.from(target.querySelectorAll('[data-testid="callback-row"]'));

  const text = (element: Element | null | undefined) =>
    element?.textContent?.trim().replace(/\s+/g, ' ');

  const addFilterButton = () =>
    document.querySelector<HTMLButtonElement>(
      '[data-testid="callbacks-add-filter-button"]',
    );

  const menuItems = (menu: Element | null) =>
    Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const chipButton = (field: string) =>
    document.querySelector<HTMLButtonElement>(
      `button[aria-controls="callbacks-filter-chip-${field}"]`,
    );

  const chipMenu = (field: string) =>
    document.querySelector(`#callbacks-filter-chip-${field}`);

  const addFilter = (label: string) => {
    addFilterButton()?.click();
    flushSync();
    menuItems(document.querySelector('#callbacks-add-filter-menu'))
      .find((item) => item.textContent?.trim() === label)
      ?.click();
    flushSync();
  };

  const operatorButtons = (field: string) =>
    Array.from(
      chipMenu(field)?.querySelectorAll<HTMLButtonElement>(
        '[data-testid="callbacks-filter-operator"]',
      ) ?? [],
    );

  const pickOperator = (field: string, label: string) => {
    operatorButtons(field)
      .find((button) => text(button) === label)
      ?.click();
    flushSync();
  };

  const valueInput = (field: string) =>
    document.querySelector<HTMLInputElement>(
      `#callbacks-filter-chip-${field}-value`,
    );

  const typeValue = (field: string, value: string) => {
    const input = valueInput(field);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    flushSync();
  };

  const clickInChip = (field: string, testId: string) => {
    chipMenu(field)
      ?.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`)
      ?.click();
    flushSync();
  };

  const pickChoice = (field: string, label: string) => {
    menuItems(chipMenu(field))
      .find((item) => text(item)?.endsWith(label))
      ?.click();
    flushSync();
  };

  const lastGotoUrl = async () => {
    const { goto } = await import('$app/navigation');
    const calls = vi.mocked(goto).mock.calls;
    return new URL(String(calls.at(-1)?.[0]), 'http://localhost:3000');
  };

  beforeEach(async () => {
    const { goto } = await import('$app/navigation');
    vi.mocked(goto).mockClear();
  });

  it('shows a filter bar with an Add Filter button above the table', () => {
    const target = renderCallbacks(callbacks);
    const bar = target.querySelector('[data-testid="callbacks-filter-bar"]');
    const table = target.querySelector('[data-testid="callback-row"]');

    expect(addFilterButton()?.textContent).toContain('Add Filter');
    expect(bar?.contains(addFilterButton() ?? null)).toBe(true);
    expect(
      bar && table
        ? bar.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING
        : 0,
    ).toBeTruthy();
    expect(rows(target)).toHaveLength(3);
  });

  it('lists the five filter fields in the Add Filter menu', () => {
    renderCallbacks(callbacks);
    addFilterButton()?.click();
    flushSync();

    expect(
      menuItems(document.querySelector('#callbacks-add-filter-menu')).map(
        (item) => item.textContent?.trim(),
      ),
    ).toEqual([
      'Delivery State',
      'Task Queue',
      'Nexus Service',
      'Nexus Operation',
      'Target Execution Type',
    ]);
  });

  it('opens a typed keyword editor with operators when a keyword field is picked', () => {
    renderCallbacks(callbacks);

    addFilter('Nexus Service');

    const menu = chipMenu('service');
    expect(chipButton('service')?.getAttribute('aria-expanded')).toBe('true');
    expect(menu?.textContent).toContain('Filter by Nexus Service');
    expect(operatorButtons('service').map((button) => text(button))).toEqual([
      'Equal to',
      'Not equal to',
      'Starts with',
    ]);
    expect(operatorButtons('service')[0].getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(valueInput('service')?.value).toBe('');
    expect(menuItems(menu)).toHaveLength(0);
  });

  it('writes the typed value and operator to the URL and returns to the first page on Apply', async () => {
    const { goto } = await import('$app/navigation');
    renderCallbacks(callbacks, '?callbacks-page=2');
    vi.mocked(goto).mockClear();
    addFilter('Task Queue');

    pickOperator('taskQueue', 'Starts with');
    typeValue('taskQueue', '  orders ');
    expect(vi.mocked(goto)).not.toHaveBeenCalled();

    clickInChip('taskQueue', 'callbacks-filter-apply');

    const url = await lastGotoUrl();
    expect(url.searchParams.get('callbacks-task-queue')).toBe('orders');
    expect(url.searchParams.get('callbacks-task-queue-operator')).toBe(
      'starts-with',
    );
    expect(url.searchParams.has('callbacks-page')).toBe(false);
    expect(chipButton('taskQueue')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('shows only the callbacks that match the keyword filters in the URL, with a chip per field', () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-task-queue=orders-tq&callbacks-operation=update&callbacks-operation-operator=starts-with',
    );

    expect(rows(target)).toHaveLength(1);
    expect(rows(target)[0].textContent).toContain('update-workflow');
    expect(text(chipButton('taskQueue'))).toBe('Task Queue = orders-tq');
    expect(text(chipButton('operation'))).toBe(
      'Nexus Operation starts with update',
    );
    expect(chipButton('service')).toBeNull();
  });

  it('excludes matching callbacks with the not-equal operator', () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-service=order-service&callbacks-service-operator=not-equal',
    );

    expect(rows(target)).toHaveLength(1);
    expect(rows(target)[0].textContent).toContain('billing-service');
    expect(text(chipButton('service'))).toBe('Nexus Service != order-service');
  });

  it('seeds the editor from the applied filter and removes it with Remove', async () => {
    renderCallbacks(
      callbacks,
      '?callbacks-service=order&callbacks-service-operator=starts-with',
    );
    chipButton('service')?.click();
    flushSync();

    expect(valueInput('service')?.value).toBe('order');
    expect(
      operatorButtons('service')
        .find((button) => text(button) === 'Starts with')
        ?.getAttribute('aria-pressed'),
    ).toBe('true');

    clickInChip('service', 'callbacks-filter-remove');

    const url = await lastGotoUrl();
    expect(url.searchParams.has('callbacks-service')).toBe(false);
    expect(url.searchParams.has('callbacks-service-operator')).toBe(false);
  });

  it('removes the filter when applied with a blank value', async () => {
    renderCallbacks(callbacks, '?callbacks-operation=start-workflow');
    chipButton('operation')?.click();
    flushSync();

    typeValue('operation', '   ');
    clickInChip('operation', 'callbacks-filter-apply');

    const url = await lastGotoUrl();
    expect(url.searchParams.has('callbacks-operation')).toBe(false);
  });

  it('discards a typed value when the editor closes without Apply', async () => {
    const { goto } = await import('$app/navigation');
    renderCallbacks(callbacks, '?callbacks-service=order-service');
    chipButton('service')?.click();
    flushSync();
    typeValue('service', 'billing-service');

    document.body.click();
    flushSync();
    chipButton('service')?.click();
    flushSync();

    expect(vi.mocked(goto)).not.toHaveBeenCalled();
    expect(valueInput('service')?.value).toBe('order-service');
  });

  it('removes a chip with no filter when its editor closes', () => {
    renderCallbacks(callbacks);
    addFilter('Nexus Operation');
    expect(chipButton('operation')).not.toBeNull();

    document.body.click();
    flushSync();

    expect(chipButton('operation')).toBeNull();
  });

  it('lists every delivery state as a checkbox and applies a pick immediately', async () => {
    renderCallbacks(callbacks, '?callbacks-page=2');
    addFilter('Delivery State');

    const labels = [
      'Standby',
      'Scheduled',
      'Backing Off',
      'Blocked',
      'Failed',
      'Success',
    ];
    const items = menuItems(chipMenu('state'));
    expect(items).toHaveLength(labels.length);
    items.forEach((item, index) => {
      expect(item.querySelector('input[type="checkbox"]')).not.toBeNull();
      expect(text(item)?.endsWith(labels[index])).toBe(true);
    });

    pickChoice('state', 'Failed');
    let url = await lastGotoUrl();
    expect(url.searchParams.get('callbacks-state')).toBe('Failed');
    expect(url.searchParams.has('callbacks-page')).toBe(false);

    pickChoice('state', 'Blocked');
    url = await lastGotoUrl();
    expect(url.searchParams.get('callbacks-state')).toBe('Failed,Blocked');
  });

  it('shows only the callbacks in the delivery states from the URL', () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-state=Failed,Succeeded',
    );

    expect(rows(target)).toHaveLength(2);
    expect(text(chipButton('state'))).toBe('Delivery State = Failed, Success');
  });

  it('filters by the target execution type of succeeded callbacks', () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-target-type=workflow',
    );

    expect(rows(target)).toHaveLength(1);
    expect(rows(target)[0].textContent).toContain('billing-tq');
    expect(text(chipButton('targetType'))).toBe(
      'Target Execution Type = Workflow Execution',
    );
  });

  it('removes a checkbox chip with nothing picked when it closes', () => {
    renderCallbacks(callbacks);
    addFilter('Target Execution Type');
    expect(chipButton('targetType')).not.toBeNull();

    document.body.click();
    flushSync();

    expect(chipButton('targetType')).toBeNull();
  });

  it('disables fields that already have a chip in the Add Filter menu', () => {
    renderCallbacks(callbacks, '?callbacks-task-queue=orders-tq');
    addFilterButton()?.click();
    flushSync();

    const taskQueue = menuItems(
      document.querySelector('#callbacks-add-filter-menu'),
    ).find((item) => item.textContent?.trim() === 'Task Queue');
    expect(taskQueue?.getAttribute('aria-disabled')).toBe('true');
  });

  it('clears every filter from the bar', async () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-task-queue=orders-tq&callbacks-task-queue-operator=not-equal&callbacks-state=Failed',
    );
    const clearAll = target.querySelector<HTMLButtonElement>(
      '[data-testid="callbacks-clear-all-filters"]',
    );

    clearAll?.click();
    flushSync();

    const url = await lastGotoUrl();
    expect(text(clearAll)).toBe('Clear all');
    expect(url.searchParams.has('callbacks-task-queue')).toBe(false);
    expect(url.searchParams.has('callbacks-task-queue-operator')).toBe(false);
    expect(url.searchParams.has('callbacks-state')).toBe(false);
  });

  it('hides Clear all when nothing is filtered', () => {
    const target = renderCallbacks(callbacks);

    expect(
      target.querySelector('[data-testid="callbacks-clear-all-filters"]'),
    ).toBeNull();
  });

  it('shows a no-matches state, not the empty state, when filters hide every callback', async () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-task-queue=missing-tq',
    );

    expect(rows(target)).toHaveLength(0);
    expect(
      target.querySelector('[data-testid="callbacks-empty-state"]'),
    ).toBeNull();
    const noMatches = target.querySelector(
      '[data-testid="callbacks-no-matches"]',
    );
    expect(noMatches?.textContent).toContain(
      'No callbacks match the current filters.',
    );

    noMatches?.querySelector('button')?.click();
    flushSync();

    const url = await lastGotoUrl();
    expect(url.searchParams.has('callbacks-task-queue')).toBe(false);
  });

  it('keeps the SDK empty state when the operation has no callbacks', () => {
    const target = renderCallbacks([]);

    expect(
      target.querySelector('[data-testid="callbacks-empty-state"]'),
    ).not.toBeNull();
    expect(
      target.querySelector('[data-testid="callbacks-no-matches"]'),
    ).toBeNull();
  });
});
