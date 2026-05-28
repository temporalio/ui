import { SvelteDate } from 'svelte/reactivity';
import { get, type Writable } from 'svelte/store';

import { getExponentialBackoff } from '$lib/utilities/refresh-rate';

interface CountPollerOptions<T> {
  fetch: ({ signal }: { signal: AbortSignal }) => Promise<T>;
  transform: (response: T) => number;
  getStore: () => Writable<{ count: number; newCount: number }>;
  disabled?: () => boolean;
  /** Reads inside this function become reactive dependencies — when they change, the poller resets from the initial fetch. */
  watch?: () => void;
  onInitialFetch?: (count: number, response: T) => void;
  onPollFetch?: (newCount: number, response: T) => void;
  onRefresh?: (time: number) => void;
  onReset?: () => void;
  initialIntervalSeconds?: number;
  maxAttempts?: number;
}

export function createCountPoller<T>(opts: CountPollerOptions<T>) {
  const initialIntervalSeconds = opts.initialIntervalSeconds ?? 60;
  const maxAttempts = opts.maxAttempts ?? 20;

  let attempt = 1;
  let loading = $state(false);
  let refreshTime = $state(0);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  function isDisabled() {
    return opts.disabled?.() ?? false;
  }

  function setRefresh() {
    const now = Date.now();
    refreshTime = now;
    opts.onRefresh?.(now);
  }

  async function fetchInitial(signal: AbortSignal) {
    loading = true;
    try {
      const response = await opts.fetch({ signal });
      if (signal.aborted) return;

      const count = opts.transform(response);
      opts.getStore().update((s) => ({ ...s, count }));
      setRefresh();
      opts.onInitialFetch?.(count, response);
    } catch (e: unknown) {
      console.error('Initial count fetch failed', e);
    } finally {
      loading = false;
    }
  }

  async function fetchPoll(signal: AbortSignal) {
    try {
      const response = await opts.fetch({ signal });
      if (signal.aborted) return;

      const newCount = opts.transform(response) - get(opts.getStore()).count;
      opts.getStore().update((s) => ({ ...s, newCount }));
      opts.onPollFetch?.(newCount, response);
    } catch (e: unknown) {
      console.error('Polling count fetch failed', e);
    } finally {
      attempt += 1;
    }
  }

  function scheduleNextPoll(signal: AbortSignal) {
    const intervalMs = getExponentialBackoff(initialIntervalSeconds, attempt);
    timeoutId = setTimeout(async () => {
      await fetchPoll(signal);
      if (!signal.aborted && !isDisabled() && attempt <= maxAttempts) {
        scheduleNextPoll(signal);
      }
    }, intervalMs);
  }

  function applyReset() {
    attempt = 1;
    opts.getStore().update((s) => ({ ...s, newCount: 0 }));
    opts.onReset?.();
  }

  $effect(function initializeAndSetupPolling() {
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    async function run() {
      await fetchInitial(abortSignal);
      if (abortSignal.aborted) return;

      if (!isDisabled() && attempt <= maxAttempts) {
        scheduleNextPoll(abortSignal);
      }
    }

    opts.watch?.();
    applyReset();
    run();

    return () => {
      abortController.abort();
      clearTimer();
    };
  });

  return {
    get loading() {
      return loading;
    },
    /** Timestamp of the most recent full fetch. Not updated by poll fetches. */
    get refreshTime() {
      return refreshTime;
    },
  };
}
