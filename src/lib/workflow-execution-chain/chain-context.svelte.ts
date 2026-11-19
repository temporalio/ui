import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

import { retryWithBackoff } from './retry-with-backoff';
import type {
  ChainClient,
  ChainEvent,
  ChainRun,
  WorkflowExecutionChainIdentity,
} from './types';

import { DiscoveryFailures } from './discovery-failures.svelte';
import { RunRecord } from './run-record.svelte';

type RunRecords = {
  get: (runId: string) => RunRecord | undefined;
  recordFor: (runId: string) => RunRecord;
  values: () => IterableIterator<RunRecord>;
};

/**
 * What every part of the chain shares: identity, the Run records, client
 * calls retried with backoff and aborted on dispose, the event listeners and
 * the discovery failures. Not a Svelte context.
 */
export type ChainContext = {
  readonly identity: Readonly<WorkflowExecutionChainIdentity>;
  readonly client: ChainClient;
  readonly records: RunRecords;
  readonly failures: DiscoveryFailures;
  readonly disposed: boolean;
  retry: <T>(request: (signal: AbortSignal) => Promise<T>) => Promise<T>;
  describeCurrent: () => Promise<WorkflowExecution>;
  describe: (runId: string) => Promise<WorkflowExecution>;
  fetchStartedEvent: (runId: string) => Promise<HistoryEvent>;
  fetchCloseEvent: (runId: string) => Promise<HistoryEvent>;
  getOrFetchRun: (runId: string) => Promise<ChainRun>;
  refreshRun: (runId: string) => Promise<ChainRun>;
  storeRun: (
    runId: string,
    workflow: WorkflowExecution,
    startedEvent: HistoryEvent,
  ) => ChainRun;
  emit: (event: ChainEvent) => void;
  subscribe: (listener: (event: ChainEvent) => void) => () => void;
  dispose: () => void;
};

export const readStartedEvent = (
  event: HistoryEvent,
): { continuedExecutionRunId?: string; firstExecutionRunId?: string } => {
  const attributes = event.workflowExecutionStartedEventAttributes;
  return {
    continuedExecutionRunId: attributes?.continuedExecutionRunId || undefined,
    firstExecutionRunId: attributes?.firstExecutionRunId || undefined,
  };
};

export const createChainContext = (
  identity: Readonly<WorkflowExecutionChainIdentity>,
  client: ChainClient,
): ChainContext => {
  const { namespace, workflowId } = identity;
  const abort = new AbortController();
  const listeners = new SvelteSet<(event: ChainEvent) => void>();
  const recordMap = new SvelteMap<string, RunRecord>();

  const records: RunRecords = {
    get: (runId) => recordMap.get(runId),
    recordFor: (runId) => {
      const existing = recordMap.get(runId);
      if (existing) {
        return existing;
      }
      const record = new RunRecord(runId);
      recordMap.set(runId, record);
      return record;
    },
    values: () => recordMap.values(),
  };

  const emit = (event: ChainEvent): void => {
    if (abort.signal.aborted) {
      return;
    }
    for (const listener of listeners) {
      listener(event);
    }
  };

  const retry = <T>(
    request: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> => {
    const signal = abort.signal;
    return retryWithBackoff(() => request(signal), signal);
  };

  const describe = (runId?: string): Promise<WorkflowExecution> =>
    retry((signal) =>
      client.describe({ namespace, workflowId, runId }, signal),
    );

  const fetchStartedEvent = (runId: string): Promise<HistoryEvent> =>
    retry((signal) =>
      client.fetchStartedEvent({ namespace, workflowId, runId }, signal),
    );

  const fetchCloseEvent = (runId: string): Promise<HistoryEvent> =>
    retry((signal) =>
      client.fetchCloseEvent({ namespace, workflowId, runId }, signal),
    );

  const storeRun = (
    runId: string,
    workflow: WorkflowExecution,
    startedEvent: HistoryEvent,
  ): ChainRun => {
    const run = { runId, workflow, startedEvent };
    records.recordFor(runId).run = run;
    return run;
  };

  const fetchAndStoreRun = async (runId: string): Promise<ChainRun> => {
    const [workflow, startedEvent] = await Promise.all([
      describe(runId),
      fetchStartedEvent(runId),
    ]);
    return storeRun(runId, workflow, startedEvent);
  };

  const refreshRun = (runId: string): Promise<ChainRun> => {
    const record = records.recordFor(runId);
    record.pendingFetch ??= fetchAndStoreRun(runId).finally(() => {
      record.pendingFetch = null;
    });
    return record.pendingFetch;
  };

  const getOrFetchRun = (runId: string): Promise<ChainRun> => {
    const run = recordMap.get(runId)?.run;
    if (run) {
      return Promise.resolve(run);
    }
    return refreshRun(runId);
  };

  return {
    identity,
    client,
    records,
    failures: new DiscoveryFailures((step) =>
      emit({ type: 'discoveryError', step }),
    ),
    get disposed() {
      return abort.signal.aborted;
    },
    retry,
    describeCurrent: () => describe(),
    describe,
    fetchStartedEvent,
    fetchCloseEvent,
    getOrFetchRun,
    refreshRun,
    storeRun,
    emit,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      abort.abort();
      listeners.clear();
    },
  };
};
