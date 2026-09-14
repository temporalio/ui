// @vitest-environment node

import { get } from 'svelte/store';

import { describe, expect, it, vi } from 'vitest';

import { createCatalogSessionStore } from './session-store';
import type { BrowserCatalogDescriptor } from './types';
import type { WorkbenchHost } from './workbench-host';

const descriptor: BrowserCatalogDescriptor = {
  id: 'order-lifecycle',
  source: { id: 'oss', label: 'OSS' },
  title: 'Order lifecycle',
  description: 'Start and inspect an order workflow.',
  capabilityTags: [],
  expectedEvidence: [],
  input: { defaultValue: {}, schema: true },
  startOptions: { defaultValue: {}, schema: true },
  execution: {
    kind: 'workflow',
    targetId: 'catalog',
    namespace: 'default',
    taskQueue: 'catalog',
    workflowType: 'OrderLifecycle',
  },
};

const host = (start: WorkbenchHost['start']): WorkbenchHost => ({
  start,
  checkReadiness: vi.fn(async () => []),
  observe: vi.fn(),
  evidenceLink: vi.fn(),
});

const accepted = (attemptId: string, executionId: string) => ({
  status: 'accepted' as const,
  reference: {
    exampleId: descriptor.id,
    kind: 'workflow' as const,
    attempt: { attemptId, executionId },
    target: {
      targetId: descriptor.execution.targetId,
      namespace: descriptor.execution.namespace,
      taskQueue: descriptor.execution.taskQueue,
    },
    runId: 'run-1',
  },
});

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

describe('Catalog session store', () => {
  it('does not request a host start when launch policy denies the descriptor', async () => {
    const start = vi.fn<WorkbenchHost['start']>();
    const store = createCatalogSessionStore(host(start), {
      createId: vi.fn(() => 'unused-id'),
      startAllowed: () => false,
    });

    await expect(
      store.start({ descriptor, input: {}, startOptions: {} }),
    ).resolves.toBeUndefined();
    expect(start).not.toHaveBeenCalled();
  });

  it('keeps editor drafts scoped to each example', () => {
    const store = createCatalogSessionStore(host(vi.fn()));

    store.setDraft(descriptor.id, {
      inputEditor: '{"customer":"customer-1"}',
      startOptionsEditor: '{"workflowId":"order-1"}',
    });
    store.setDraft('payment-lifecycle', {
      inputEditor: '{"payment":"payment-1"}',
      startOptionsEditor: '{"workflowId":"payment-1"}',
    });

    expect(store.getDraft(descriptor.id)).toEqual({
      inputEditor: '{"customer":"customer-1"}',
      startOptionsEditor: '{"workflowId":"order-1"}',
    });
    expect(store.getDraft('payment-lifecycle')).toEqual({
      inputEditor: '{"payment":"payment-1"}',
      startOptionsEditor: '{"workflowId":"payment-1"}',
    });
  });

  it('resets drafts and sessions without accepting late launches', async () => {
    const firstLaunch = deferred<ReturnType<typeof accepted>>();
    const start = vi
      .fn<WorkbenchHost['start']>()
      .mockImplementationOnce(() => firstLaunch.promise)
      .mockResolvedValueOnce({
        status: 'rejected',
        reason: 'conflict',
        reference: {
          exampleId: descriptor.id,
          kind: 'workflow',
          attempt: { attemptId: 'attempt-2', executionId: 'execution-2' },
          target: descriptor.execution,
        },
      });
    const store = createCatalogSessionStore(host(start), {
      createId: (() => {
        const ids = ['attempt-1', 'execution-1', 'attempt-2', 'execution-2'];
        return () => ids.shift() as string;
      })(),
    });

    const first = store.start({ descriptor, input: {}, startOptions: {} });
    store.setDraft(descriptor.id, {
      inputEditor: '{"customer":"customer-1"}',
      startOptionsEditor: '{"workflowId":"order-1"}',
    });
    store.reset();
    firstLaunch.resolve(accepted('attempt-1', 'execution-1'));

    await first;
    expect(get(store).sessions).toEqual([]);
    expect(store.getDraft(descriptor.id)).toBeUndefined();
    expect(start.mock.calls[0]?.[1]?.aborted).toBe(true);

    await store.start({ descriptor, input: {}, startOptions: {} });
    expect(store.getSessions()[0]).toMatchObject({
      id: 'attempt-2',
      state: 'launch-rejected',
    });
  });

  it('keeps distinct concurrent launch attempts and snapshots mutable launch values', async () => {
    const start = vi
      .fn<WorkbenchHost['start']>()
      .mockResolvedValueOnce({
        status: 'rejected',
        reason: 'conflict',
        reference: {
          exampleId: descriptor.id,
          kind: 'workflow',
          attempt: { attemptId: 'attempt-1', executionId: 'execution-1' },
          target: descriptor.execution,
        },
      })
      .mockResolvedValueOnce({
        status: 'rejected',
        reason: 'conflict',
        reference: {
          exampleId: descriptor.id,
          kind: 'workflow',
          attempt: { attemptId: 'attempt-2', executionId: 'execution-2' },
          target: descriptor.execution,
        },
      });
    const input = { customer: { id: 'customer-1' } };
    const startOptions = { workflowId: 'order-1' };
    const store = createCatalogSessionStore(host(start), {
      createId: (() => {
        const ids = ['attempt-1', 'execution-1', 'attempt-2', 'execution-2'];
        return () => ids.shift() as string;
      })(),
    });

    const first = store.start({ descriptor, input, startOptions });
    input.customer.id = 'mutated';
    startOptions.workflowId = 'mutated';
    const second = store.start({ descriptor, input, startOptions });
    await Promise.all([first, second]);

    expect(get(store).sessions).toMatchObject([
      {
        id: 'attempt-2',
        input: { customer: { id: 'mutated' } },
        startOptions: { workflowId: 'mutated' },
        state: 'launch-rejected',
      },
      {
        id: 'attempt-1',
        input: { customer: { id: 'customer-1' } },
        startOptions: { workflowId: 'order-1' },
        state: 'launch-rejected',
      },
    ]);
    expect(start).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: { customer: { id: 'customer-1' } },
        startOptions: { workflowId: 'order-1' },
      }),
      expect.any(AbortSignal),
    );
  });

  it('observes an accepted attempt after its last subscriber unsubscribes', async () => {
    const observation = deferred<{
      state: 'terminal';
      status: 'completed';
      snapshot: { done: boolean };
    }>();
    const catalogHost = host(
      vi.fn().mockResolvedValue(accepted('attempt-1', 'execution-1')),
    );
    catalogHost.observe = vi.fn(() => observation.promise);
    const store = createCatalogSessionStore(catalogHost, {
      createId: (() => {
        const ids = ['attempt-1', 'execution-1'];
        return () => ids.shift() as string;
      })(),
    });
    const unsubscribe = store.subscribe(() => undefined);

    await store.start({ descriptor, input: {}, startOptions: {} });
    unsubscribe();
    observation.resolve({
      state: 'terminal',
      status: 'completed',
      snapshot: { done: true },
    });
    await vi.waitFor(() => {
      expect(store.getSessions()[0]).toMatchObject({
        state: 'execution-terminal',
        snapshot: { done: true },
        terminalStatus: 'completed',
      });
    });
  });

  it('pauses, resumes, and logs each accepted outcome and terminal observation once', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const catalogHost = host(
      vi.fn().mockResolvedValue(accepted('attempt-1', 'execution-1')),
    );
    catalogHost.observe = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary observation failure'))
      .mockResolvedValueOnce({
        state: 'terminal',
        status: 'completed',
        snapshot: { done: true },
      });
    const store = createCatalogSessionStore(catalogHost, {
      createId: (() => {
        const ids = ['attempt-1', 'execution-1'];
        return () => ids.shift() as string;
      })(),
    });

    await store.start({ descriptor, input: {}, startOptions: {} });
    await vi.waitFor(() => {
      expect(store.getSessions()[0]?.state).toBe('observation-paused');
    });
    store.resume('attempt-1');
    await vi.waitFor(() => {
      expect(store.getSessions()[0]?.state).toBe('execution-terminal');
    });

    const events = info.mock.calls.map(([event]) =>
      JSON.parse(event as string),
    );
    expect(
      events.filter(
        (event) => event.event === 'launch' && event.status === 'requested',
      ),
    ).toHaveLength(1);
    expect(
      events.filter(
        (event) => event.event === 'launch' && event.status === 'accepted',
      ),
    ).toHaveLength(1);
    expect(
      events.filter(
        (event) => event.event === 'observation' && event.status === 'paused',
      ),
    ).toHaveLength(1);
    expect(
      events.filter(
        (event) => event.event === 'observation' && event.status === 'terminal',
      ),
    ).toHaveLength(1);
    expect(store.latest(descriptor.id, descriptor.execution)).toMatchObject({
      id: 'attempt-1',
    });
    info.mockRestore();
  });

  it('stops and disposes attempts without allowing late launch results to mutate them', async () => {
    const firstLaunch = deferred<ReturnType<typeof accepted>>();
    const secondLaunch = deferred<ReturnType<typeof accepted>>();
    const catalogHost = host(
      vi
        .fn()
        .mockImplementationOnce(() => firstLaunch.promise)
        .mockImplementationOnce(() => secondLaunch.promise),
    );
    const store = createCatalogSessionStore(catalogHost, {
      createId: (() => {
        const ids = ['attempt-1', 'execution-1', 'attempt-2', 'execution-2'];
        return () => ids.shift() as string;
      })(),
    });

    const stopped = store.start({ descriptor, input: {}, startOptions: {} });
    store.stop('attempt-1');
    firstLaunch.resolve(accepted('attempt-1', 'execution-1'));
    await stopped;
    expect(store.getSessions()[0]?.state).toBe('stopped');

    const disposed = store.start({ descriptor, input: {}, startOptions: {} });
    store.dispose();
    secondLaunch.resolve(accepted('attempt-2', 'execution-2'));
    await disposed;
    expect(store.getSessions()[0]?.state).toBe('starting');
  });
});
