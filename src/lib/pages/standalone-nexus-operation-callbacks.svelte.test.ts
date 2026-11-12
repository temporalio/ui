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
  ): Callback =>
    ({
      state: 'Standby',
      requestId: `request-${index}`,
      callback: { nexusHandler: { taskQueueName, service, operation } },
    }) as unknown as Callback;

  const callbacks = [
    handlerCallback(0, 'orders-tq', 'order-service', 'start-workflow'),
    handlerCallback(1, 'orders-tq', 'order-service', 'update-workflow'),
    handlerCallback(2, 'billing-tq', 'billing-service', 'start-workflow'),
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

  const pickValue = (field: string, value: string) => {
    menuItems(chipMenu(field))
      .find((item) => item.textContent?.includes(value))
      ?.click();
    flushSync();
  };

  const applyButton = (field: string) =>
    chipMenu(field)?.querySelector<HTMLButtonElement>(
      '[data-testid="callbacks-filter-apply"]',
    );

  const addFilter = (label: string) => {
    addFilterButton()?.click();
    flushSync();
    menuItems(document.querySelector('#callbacks-add-filter-menu'))
      .find((item) => item.textContent?.trim() === label)
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

  it('lists the three filter fields in the Add Filter menu', () => {
    renderCallbacks(callbacks);
    addFilterButton()?.click();
    flushSync();

    expect(
      menuItems(document.querySelector('#callbacks-add-filter-menu')).map(
        (item) => item.textContent?.trim(),
      ),
    ).toEqual(['Task Queue', 'Nexus Service', 'Nexus Operation']);
  });

  it('opens a dropdown of the field’s values, with counts, when a field is picked', () => {
    renderCallbacks(callbacks);

    addFilter('Nexus Service');

    const menu = chipMenu('service');
    expect(chipButton('service')?.getAttribute('aria-expanded')).toBe('true');
    expect(menu?.textContent).toContain('Filter by Nexus Service');
    const items = menuItems(menu).map((item) => text(item));
    expect(items).toHaveLength(2);
    expect(items.find((item) => item?.includes('order-service'))).toMatch(
      / 2$/,
    );
    expect(items.find((item) => item?.includes('billing-service'))).toMatch(
      / 1$/,
    );
    expect(chipMenu('endpoint')).toBeNull();
  });

  it('shows only the callbacks that match the filters in the URL, with a chip per field', () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-endpoint=orders-tq&callbacks-operation=update-workflow',
    );

    expect(rows(target)).toHaveLength(1);
    expect(rows(target)[0].textContent).toContain('update-workflow');
    expect(text(chipButton('endpoint'))).toBe('Task Queue = orders-tq');
    expect(text(chipButton('operation'))).toBe(
      'Nexus Operation = update-workflow',
    );
    expect(chipButton('service')).toBeNull();
  });

  it('disables fields that already have a chip in the Add Filter menu', () => {
    renderCallbacks(callbacks, '?callbacks-endpoint=orders-tq');
    addFilterButton()?.click();
    flushSync();

    const endpoint = menuItems(
      document.querySelector('#callbacks-add-filter-menu'),
    ).find((item) => item.textContent?.trim() === 'Task Queue');
    expect(endpoint?.getAttribute('aria-disabled')).toBe('true');
  });

  it('adds the picked values to the URL and returns to the first page on Apply', async () => {
    const { goto } = await import('$app/navigation');
    renderCallbacks(callbacks, '?callbacks-page=2');
    vi.mocked(goto).mockClear();
    addFilter('Task Queue');

    pickValue('endpoint', 'billing-tq');
    pickValue('endpoint', 'orders-tq');
    expect(vi.mocked(goto)).not.toHaveBeenCalled();

    applyButton('endpoint')?.click();
    flushSync();

    const url = await lastGotoUrl();
    expect(url.searchParams.get('callbacks-endpoint')).toBe(
      'billing-tq,orders-tq',
    );
    expect(url.searchParams.has('callbacks-page')).toBe(false);
    expect(chipButton('endpoint')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('removes an applied value on Apply', async () => {
    renderCallbacks(callbacks, '?callbacks-service=order-service');
    chipButton('service')?.click();
    flushSync();

    pickValue('service', 'order-service');
    applyButton('service')?.click();
    flushSync();

    const url = await lastGotoUrl();
    expect(url.searchParams.has('callbacks-service')).toBe(false);
  });

  it('discards picked values when the dropdown closes without Apply', async () => {
    const { goto } = await import('$app/navigation');
    renderCallbacks(callbacks, '?callbacks-service=order-service');
    chipButton('service')?.click();
    flushSync();
    pickValue('service', 'billing-service');

    document.body.click();
    flushSync();
    chipButton('service')?.click();
    flushSync();

    const checked = menuItems(chipMenu('service'))
      .filter((item) => item.querySelector('input[type="checkbox"]:checked'))
      .map((item) => text(item));
    expect(vi.mocked(goto)).not.toHaveBeenCalled();
    expect(checked).toHaveLength(1);
    expect(checked[0]).toContain('order-service');
  });

  it('removes a chip with no values when its dropdown closes', () => {
    renderCallbacks(callbacks);
    addFilter('Nexus Operation');
    expect(chipButton('operation')).not.toBeNull();

    document.body.click();
    flushSync();

    expect(chipButton('operation')).toBeNull();
  });

  it('narrows the field’s values with the search box', () => {
    renderCallbacks(callbacks);
    addFilter('Task Queue');
    const menu = chipMenu('endpoint');
    const search = menu?.querySelector<HTMLInputElement>(
      'input[type="search"]',
    );

    if (search) {
      search.value = 'billing';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    flushSync();

    expect(search).not.toBeNull();
    expect(menu?.textContent).toContain('billing-tq');
    expect(menu?.textContent).not.toContain('orders-tq');
  });

  it('clears every filter from the bar', async () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-endpoint=orders-tq&callbacks-service=order-service',
    );
    const clearAll = target.querySelector<HTMLButtonElement>(
      '[data-testid="callbacks-clear-all-filters"]',
    );

    clearAll?.click();
    flushSync();

    const url = await lastGotoUrl();
    expect(text(clearAll)).toBe('Clear all');
    expect(url.searchParams.has('callbacks-endpoint')).toBe(false);
    expect(url.searchParams.has('callbacks-service')).toBe(false);
  });

  it('hides Clear all when nothing is filtered', () => {
    const target = renderCallbacks(callbacks);

    expect(
      target.querySelector('[data-testid="callbacks-clear-all-filters"]'),
    ).toBeNull();
  });

  it('shows a no-matches state, not the empty state, when filters hide every callback', async () => {
    const target = renderCallbacks(callbacks, '?callbacks-endpoint=missing-tq');

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
    expect(url.searchParams.has('callbacks-endpoint')).toBe(false);
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
