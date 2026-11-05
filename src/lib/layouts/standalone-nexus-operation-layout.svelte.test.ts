import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { base } from '$app/paths';
import { page } from '$app/state';

import type { NexusOperationExecution } from '$lib/types/nexus-operation-execution';
import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

import { MOCK_NEXUS_OPERATION } from '../../../tests/test-utilities/mocks/nexus-operations';

import StandaloneNexusOperationLayout from './standalone-nexus-operation-layout.svelte';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

Object.defineProperties(HTMLDialogElement.prototype, {
  close: {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = false;
    },
  },
  showModal: {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = true;
    },
  },
});

vi.mock(
  '$lib/utilities/standalone-nexus-operation-poller.svelte',
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import('$lib/utilities/standalone-nexus-operation-poller.svelte')
      >();
    return {
      ...original,
      StandaloneNexusOperationPoller: class {
        start() {}
        abort() {}
        fetchOnce() {}
      },
    };
  },
);

let component: ReturnType<typeof mount> | undefined;

const children = createRawSnippet(() => ({
  render: () => '<div data-testid="tab-body"></div>',
}));

const renderLayout = (completionCallbacks: unknown[] | undefined) => {
  page.url = new URL(
    `http://localhost:3000${base}/namespaces/default/nexus-operations/operation-1/run-1/callbacks`,
  );
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(StandaloneNexusOperationLayout, {
    target,
    props: {
      namespace: 'default',
      operationId: 'operation-1',
      runId: 'run-1',
      children,
    },
    context: new Map([
      ['core-context', { getUserIdentifier: () => undefined }],
    ]),
  });
  nexusOperationExecution.set({
    ...MOCK_NEXUS_OPERATION,
    completionCallbacks,
  } as unknown as NexusOperationExecution);
  flushSync();
  return target;
};

const tabs = (target: HTMLElement) =>
  Array.from(target.querySelectorAll('[role="tab"]'));

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  nexusOperationExecution.set(undefined);
  document.body.innerHTML = '';
});

describe('StandaloneNexusOperationLayout tabs', () => {
  it('puts the Callbacks tab after Details', () => {
    const target = renderLayout([{}, {}]);

    expect(tabs(target).map((tab) => tab.id)).toEqual([
      'nexus-operation-details-tab',
      'nexus-operation-callbacks-tab',
      'nexus-operation-search-attributes-tab',
      'nexus-operation-metadata-tab',
    ]);
  });

  it('links the Callbacks tab to the callbacks route and marks it active there', () => {
    const target = renderLayout([{}]);
    const callbacksTab = target.querySelector('#nexus-operation-callbacks-tab');

    expect(callbacksTab?.getAttribute('href')).toBe(
      `${base}/namespaces/default/nexus-operations/operation-1/run-1/callbacks`,
    );
    expect(callbacksTab?.getAttribute('aria-selected')).toBe('true');
  });

  it('counts the attached callbacks on the Callbacks tab', () => {
    const target = renderLayout(Array.from({ length: 11 }, () => ({})));

    expect(
      target.querySelector('#nexus-operation-callbacks-tab')?.textContent,
    ).toContain('11');
  });

  it('shows the Callbacks tab with a zero count when there are no callbacks', () => {
    const target = renderLayout(undefined);
    const callbacksTab = target.querySelector('#nexus-operation-callbacks-tab');

    expect(callbacksTab).not.toBeNull();
    expect(callbacksTab?.textContent).toContain('0');
  });
});
