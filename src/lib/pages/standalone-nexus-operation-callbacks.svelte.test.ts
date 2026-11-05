import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import { page } from '$app/state';

import type { Callback } from '$lib/types/nexus';
import type { NexusOperationExecution } from '$lib/types/nexus-operation-execution';
import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

import { MOCK_NEXUS_OPERATION } from '../../../tests/test-utilities/mocks/nexus-operations';

import StandaloneNexusOperationCallbacks from './standalone-nexus-operation-callbacks.svelte';

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

const renderCallbacks = (completionCallbacks?: Callback[]) => {
  page.url = new URL('http://localhost:3000/callbacks');
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
