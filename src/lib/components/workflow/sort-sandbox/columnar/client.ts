/**
 * Promise-shaped wrapper around the snapshot worker.
 *
 * The main thread holds no rows — only a handle to the worker and whatever
 * window is currently on screen.
 */

import SnapshotWorker from './snapshot.worker?worker';
import type { SortDirection } from './sort';
import type { DisplayRow } from './store';

export type SortKey =
  | 'status'
  | 'workflowId'
  | 'type'
  | 'startTime'
  | 'endTime'
  | 'taskQueue';

export type SortTerm = { key: SortKey; direction: SortDirection };

export type QueryPredicate = {
  field: 'ExecutionStatus' | 'WorkflowType' | 'TaskQueue';
  operator: '=' | '!=';
  value: string;
};

export type LoadProgress = {
  loaded: number;
  total: number;
  shardsDone: number;
  shardCount: number;
  requests: number;
  throttled: number;
  wireBytes: number;
  elapsedMs: number;
};

export type ShardDone = {
  index: number;
  of: number;
  rows: number;
  from: string;
  to: string;
  elapsedMs: number;
};

export type LoadPlan = {
  shards: number;
  matching: number;
  requests: number;
  elapsedMs: number;
};

export type LoadResult = {
  count: number;
  bytes: number;
  requests: number;
  throttled: number;
  wireBytes: number;
  shards: number;
  elapsedMs: number;
};

/**
 * Svelte 5 reactive values are Proxies, and postMessage cannot structured-clone
 * a Proxy. Everything crossing into the worker gets flattened here so no caller
 * has to remember.
 */
const plain = <T extends Record<string, unknown>>(items: T[]): T[] =>
  items.map((item) => ({ ...item }));

type Pending = {
  resolve: (value: unknown) => void;
  onProgress?: (progress: LoadProgress) => void;
  onPlan?: (plan: LoadPlan) => void;
  onShard?: (shard: ShardDone) => void;
};

export class SnapshotClient {
  private worker: Worker;
  private nextId = 1;
  private pending = new Map<number, Pending>();

  constructor() {
    this.worker = new SnapshotWorker();
    this.worker.onmessage = (event: MessageEvent) => {
      const { id, type } = event.data;
      const entry = this.pending.get(id);
      if (!entry) return;

      if (type === 'progress') {
        entry.onProgress?.(event.data);
        return;
      }
      if (type === 'planned') {
        entry.onPlan?.(event.data);
        return;
      }
      if (type === 'shard') {
        entry.onShard?.(event.data);
        return;
      }

      this.pending.delete(id);
      entry.resolve(event.data);
    };
  }

  private send<T>(
    message: Record<string, unknown>,
    onProgress?: (progress: LoadProgress) => void,
    onPlan?: (plan: LoadPlan) => void,
    onShard?: (shard: ShardDone) => void,
  ): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve) => {
      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        onProgress,
        onPlan,
        onShard,
      });
      this.worker.postMessage({ ...message, id });
    });
  }

  load(
    rows: number,
    query: string,
    onProgress: (progress: LoadProgress) => void,
    onPlan: (plan: LoadPlan) => void,
    onShard: (shard: ShardDone) => void,
  ) {
    return this.send<LoadResult>(
      { type: 'load', rows, query: String(query) },
      onProgress,
      onPlan,
      onShard,
    );
  }

  sort(terms: SortTerm[]) {
    return this.send<{ ms: number }>({ type: 'sort', terms: plain(terms) });
  }

  filter(text: string, statuses: string[], workflowType: string) {
    return this.send<{ count: number; ms: number }>({
      type: 'filter',
      text: String(text),
      statuses: statuses.map(String),
      workflowType: String(workflowType),
    });
  }

  window(offset: number, limit: number) {
    return this.send<{ rows: DisplayRow[]; offset: number }>({
      type: 'window',
      offset,
      limit,
    });
  }

  dispose() {
    this.worker.terminate();
    this.pending.clear();
  }
}
