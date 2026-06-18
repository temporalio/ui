import { get, writable } from 'svelte/store';

import type {
  BidirectionalProgress,
  BidirectionalStats,
} from '$lib/services/events-service';
import { fetchAllEventsBidirectional } from '$lib/services/events-service';
import {
  currentEventHistory,
  fullEventHistory,
  loadedWorkflowKey,
} from '$lib/stores/events';

// Public reactive state — subscribe to these instead of managing local variables.
export const fetchingKey = writable<string | null>(null);
export const fetchProgress = writable<BidirectionalProgress | null>(null);
export const fetchStats = writable<BidirectionalStats | null>(null);
export const fetchError = writable<string | null>(null);

let controller: AbortController | null = null;

/**
 * Start a bidirectional fetch for the given workflow run.
 * No-ops if a fetch for the same key is already in progress.
 * Aborts any in-progress fetch for a *different* key first.
 */
export function startBidirectionalFetch(
  namespace: string,
  workflowId: string,
  runId: string,
): void {
  const key = `${namespace}:${workflowId}:${runId}`;

  if (get(fetchingKey) === key) return;

  controller?.abort();
  controller = new AbortController();

  fetchingKey.set(key);
  fetchProgress.set(null);
  fetchStats.set(null);
  fetchError.set(null);
  fullEventHistory.set([]);
  currentEventHistory.set([]);
  loadedWorkflowKey.set(null);

  fetchAllEventsBidirectional({
    namespace,
    workflowId,
    runId,
    signal: controller.signal,
    maximumPageSize: 1000,
    onProgress: (p) => fetchProgress.set(p),
    onFirstPage: (firstEvents) => {
      if (firstEvents.length) currentEventHistory.set(firstEvents);
    },
    onFirstDescPage: (bookendEvents) => {
      if (!bookendEvents.length) return;
      // snapshotAccumulated() result: asc page 1 + desc page 1, already deduped.
      fullEventHistory.set(bookendEvents);
      currentEventHistory.set(bookendEvents);
    },
  })
    .then(({ events, stats }) => {
      fullEventHistory.set(events);
      currentEventHistory.set(events);
      loadedWorkflowKey.set(key);
      fetchStats.set(stats);
      fetchingKey.set(null);
    })
    .catch((e: unknown) => {
      if (e instanceof Error && e.name !== 'AbortError') {
        fetchError.set(e.message);
      }
      fetchingKey.set(null);
    });
}

/**
 * Abort the active fetch and clear all state. Call when navigating away from
 * the workflow entirely so stale data is not written into shared stores.
 */
export function abortBidirectionalFetch(): void {
  controller?.abort();
  controller = null;
  fetchingKey.set(null);
  loadedWorkflowKey.set(null);
}
