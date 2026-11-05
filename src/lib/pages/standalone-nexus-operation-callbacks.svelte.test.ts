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

afterEach(() => {
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
      'Use callbacks to send this Standalone Nexus Operation’s result anywhere you need, without needing a Workflow.',
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

  const filterButton = (target: HTMLElement) =>
    target.querySelector<HTMLButtonElement>(
      'button[aria-controls="callbacks-filter-menu"]',
    );

  const openMenu = (target: HTMLElement) => {
    filterButton(target)?.click();
    flushSync();
    return target.querySelector('#callbacks-filter-menu');
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

  it('shows a Filter button with no count when nothing is filtered', () => {
    const target = renderCallbacks(callbacks);

    expect(filterButton(target)?.textContent).toContain('Filter');
    expect(rows(target)).toHaveLength(3);
  });

  it('shows only the callbacks that match the filters in the URL', () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-endpoint=orders-tq&callbacks-operation=update-workflow',
    );

    expect(rows(target)).toHaveLength(1);
    expect(rows(target)[0].textContent).toContain('update-workflow');
    expect(filterButton(target)?.textContent).toContain('2');
  });

  it('lists every field’s values in the menu, with counts', () => {
    const target = renderCallbacks(callbacks);
    const menu = openMenu(target);

    expect(menu?.textContent).toContain('Nexus Endpoint');
    expect(menu?.textContent).toContain('Nexus Service');
    expect(menu?.textContent).toContain('Nexus Operation');
    for (const value of [
      'orders-tq',
      'billing-tq',
      'order-service',
      'billing-service',
      'start-workflow',
      'update-workflow',
    ]) {
      expect(menu?.textContent).toContain(value);
    }
  });

  it('adds a value to the URL and returns to the first page when it is picked', async () => {
    const target = renderCallbacks(callbacks, '?callbacks-page=2');
    const menu = openMenu(target);
    const option = Array.from(
      menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    ).find((item) => item.textContent?.includes('billing-tq'));

    option?.click();
    flushSync();

    const url = await lastGotoUrl();
    expect(url.searchParams.get('callbacks-endpoint')).toBe('billing-tq');
    expect(url.searchParams.has('callbacks-page')).toBe(false);
  });

  it('narrows the menu values with the search box', () => {
    const target = renderCallbacks(callbacks);
    const menu = openMenu(target);
    const search = menu?.querySelector<HTMLInputElement>(
      'input[type="search"]',
    );

    if (search) {
      search.value = 'billing';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    flushSync();

    expect(menu?.textContent).toContain('billing-tq');
    expect(menu?.textContent).toContain('billing-service');
    expect(menu?.textContent).not.toContain('orders-tq');
    expect(menu?.textContent).not.toContain('update-workflow');
  });

  it('clears every filter from the menu', async () => {
    const target = renderCallbacks(
      callbacks,
      '?callbacks-endpoint=orders-tq&callbacks-service=order-service',
    );
    const menu = openMenu(target);
    const clearAll = Array.from(
      menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    ).find((item) => item.textContent?.trim() === 'Clear all');

    clearAll?.click();
    flushSync();

    const url = await lastGotoUrl();
    expect(clearAll).toBeDefined();
    expect(url.searchParams.has('callbacks-endpoint')).toBe(false);
    expect(url.searchParams.has('callbacks-service')).toBe(false);
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
