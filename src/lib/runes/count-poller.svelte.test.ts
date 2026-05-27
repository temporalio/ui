import { get, writable, type Writable } from 'svelte/store';

import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCountPoller } from './count-poller.svelte';

type CountStore = Writable<{ count: number; newCount: number }>;

function withRoot(fn: () => void | Promise<void>) {
  let cleanup: () => void = () => {};
  const promise = new Promise<void>((resolve, reject) => {
    cleanup = $effect.root(() => {
      Promise.resolve(fn()).then(resolve, reject);
    });
  });
  return promise.finally(() => cleanup());
}

describe('createCountPoller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fetches the initial count and writes it to the store', async () => {
    await withRoot(async () => {
      const store: CountStore = writable({ count: 0, newCount: 0 });
      const fetch = vi.fn().mockResolvedValue({ count: '7' });

      createCountPoller({
        getStore: () => store,
        fetch,
        transform: (r: { count: string }) => parseInt(r.count, 10),
      });

      flushSync();
      await vi.advanceTimersByTimeAsync(0);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
      expect(get(store).count).toBe(7);
    });
  });

  it('invokes onInitialFetch with the transformed count and raw response', async () => {
    await withRoot(async () => {
      const store: CountStore = writable({ count: 0, newCount: 0 });
      const response = { count: '3', groups: [{ status: 'Running' }] };
      const onInitialFetch = vi.fn();

      createCountPoller({
        getStore: () => store,
        fetch: vi.fn().mockResolvedValue(response),
        transform: (r: typeof response) => parseInt(r.count, 10),
        onInitialFetch,
      });

      flushSync();
      await vi.advanceTimersByTimeAsync(0);

      expect(onInitialFetch).toHaveBeenCalledWith(3, response);
    });
  });

  it('polls after the initial interval and computes newCount as the delta', async () => {
    await withRoot(async () => {
      const store: CountStore = writable({ count: 0, newCount: 0 });
      const fetch = vi
        .fn()
        .mockResolvedValueOnce({ count: '5' })
        .mockResolvedValueOnce({ count: '8' });

      createCountPoller({
        getStore: () => store,
        fetch,
        transform: (r: { count: string }) => parseInt(r.count, 10),
        initialIntervalSeconds: 1,
      });

      flushSync();
      await vi.advanceTimersByTimeAsync(0);
      expect(get(store).count).toBe(5);

      await vi.advanceTimersByTimeAsync(1000);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(get(store).newCount).toBe(3);
      expect(get(store).count).toBe(5);
    });
  });

  it('skips polling when disabled() returns true', async () => {
    await withRoot(async () => {
      const store: CountStore = writable({ count: 0, newCount: 0 });
      const fetch = vi.fn().mockResolvedValue({ count: '2' });

      createCountPoller({
        getStore: () => store,
        fetch,
        transform: (r: { count: string }) => parseInt(r.count, 10),
        disabled: () => true,
        initialIntervalSeconds: 1,
      });

      flushSync();
      await vi.advanceTimersByTimeAsync(0);
      expect(fetch).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(5000);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('logs and recovers when the initial fetch rejects', async () => {
    await withRoot(async () => {
      const store: CountStore = writable({ count: 0, newCount: 0 });
      const error = new Error('boom');
      const onInitialFetch = vi.fn();

      createCountPoller({
        getStore: () => store,
        fetch: vi.fn().mockRejectedValue(error),
        transform: (r: { count: string }) => parseInt(r.count, 10),
        onInitialFetch,
      });

      flushSync();
      await vi.advanceTimersByTimeAsync(0);

      expect(console.error).toHaveBeenCalledWith(
        'Initial count fetch failed',
        error.message,
      );
      expect(get(store).count).toBe(0);
      expect(onInitialFetch).not.toHaveBeenCalled();
    });
  });

  it('logs and leaves the store unchanged when a poll fetch rejects', async () => {
    await withRoot(async () => {
      const store: CountStore = writable({ count: 0, newCount: 0 });
      const pollError = new Error('poll-failed');
      const fetch = vi
        .fn()
        .mockResolvedValueOnce({ count: '4' })
        .mockRejectedValueOnce(pollError);

      createCountPoller({
        getStore: () => store,
        fetch,
        transform: (r: { count: string }) => parseInt(r.count, 10),
        initialIntervalSeconds: 1,
      });

      flushSync();
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);

      expect(console.error).toHaveBeenCalledWith(
        'Polling count fetch failed',
        pollError.message,
      );
      expect(get(store)).toEqual({ count: 4, newCount: 0 });
    });
  });

  it('stops polling once maxAttempts is exceeded', async () => {
    await withRoot(async () => {
      const store: CountStore = writable({ count: 0, newCount: 0 });
      const fetch = vi.fn().mockResolvedValue({ count: '1' });

      createCountPoller({
        getStore: () => store,
        fetch,
        transform: (r: { count: string }) => parseInt(r.count, 10),
        initialIntervalSeconds: 1,
        maxAttempts: 2,
      });

      flushSync();
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(10_000);
      await vi.advanceTimersByTimeAsync(10_000);
      await vi.advanceTimersByTimeAsync(10_000);

      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  it('aborts in-flight fetches and stops polling when the effect root is destroyed', async () => {
    const store: CountStore = writable({ count: 0, newCount: 0 });
    const fetch = vi.fn().mockResolvedValue({ count: '1' });

    const cleanup = $effect.root(() => {
      createCountPoller({
        getStore: () => store,
        fetch,
        transform: (r: { count: string }) => parseInt(r.count, 10),
        initialIntervalSeconds: 1,
      });
    });

    flushSync();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    const signal = fetch.mock.calls[0][0].signal as AbortSignal;
    cleanup();

    expect(signal.aborted).toBe(true);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not write to the store after the signal has been aborted', async () => {
    const store: CountStore = writable({ count: 0, newCount: 0 });
    const onInitialFetch = vi.fn();
    let resolveFetch: (value: { count: string }) => void = () => {};
    const fetch = vi.fn().mockImplementation(
      () =>
        new Promise<{ count: string }>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const cleanup = $effect.root(() => {
      createCountPoller({
        getStore: () => store,
        fetch,
        transform: (r: { count: string }) => parseInt(r.count, 10),
        onInitialFetch,
      });
    });

    flushSync();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    cleanup();
    resolveFetch({ count: '99' });
    await vi.advanceTimersByTimeAsync(0);

    expect(get(store).count).toBe(0);
    expect(onInitialFetch).not.toHaveBeenCalled();
  });
});
