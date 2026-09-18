import type {
  BidirectionalProgress,
  BidirectionalStats,
} from '$lib/services/fetch-bidirectional';

import type {
  ExecutionHistoryRepositoryNotification,
  ExecutionHistoryRepositorySubscriber,
  ExecutionHistoryState,
} from './types';
import {
  type ExecutionIdentity,
  type ExecutionKey,
  getExecutionKey,
} from '../identity-keys';

/** Stores loading and streaming state for workflow execution histories. */
export class ExecutionHistoryRepository {
  private _historiesByExecutionKey = new Map<
    ExecutionKey,
    ExecutionHistoryState
  >();
  private _subscribers = new Set<ExecutionHistoryRepositorySubscriber>();
  private _snapshotCache: readonly ExecutionHistoryState[] | null = null;

  /** Returns history state for one execution. */
  getExecutionHistory(
    executionKey: ExecutionKey,
  ): ExecutionHistoryState | undefined {
    return this._historiesByExecutionKey.get(executionKey);
  }

  /** Returns the current cached point-in-time execution history snapshot. */
  getSnapshot(): readonly ExecutionHistoryState[] {
    if (this._snapshotCache) {
      return this._snapshotCache;
    }

    this._snapshotCache = [...this._historiesByExecutionKey.values()];
    return this._snapshotCache;
  }

  private _notifySubscribers(
    notification: ExecutionHistoryRepositoryNotification,
  ): void {
    for (const subscriber of this._subscribers) {
      subscriber(notification);
    }
  }

  private _upsert(executionHistory: ExecutionHistoryState): void {
    this._historiesByExecutionKey.set(
      executionHistory.executionKey,
      executionHistory,
    );
    this._snapshotCache = null;
    this._notifySubscribers({
      type: 'EXECUTION_HISTORIES_UPSERTED',
      executionHistories: [executionHistory],
    });
  }

  /**
   * Subscribe to execution history repository notifications.
   * @param options.emitCurrentSnapshot Emit the current execution history snapshot immediately after subscribing.
   * @returns Unsubscribe function.
   */
  subscribe(
    subscriber: ExecutionHistoryRepositorySubscriber,
    options?: { emitCurrentSnapshot?: boolean },
  ): () => void {
    this._subscribers.add(subscriber);

    if (options?.emitCurrentSnapshot) {
      subscriber({
        type: 'EXECUTION_HISTORIES_SNAPSHOT',
        executionHistories: this.getSnapshot(),
      });
    }

    return () => {
      this._subscribers.delete(subscriber);
    };
  }

  /** Registers a workflow execution history if it is not already present. */
  register(identity: ExecutionIdentity): ExecutionHistoryState {
    const executionKey = getExecutionKey(identity);
    const existingHistory = this._historiesByExecutionKey.get(executionKey);

    if (existingHistory) {
      return existingHistory;
    }

    const executionHistory: ExecutionHistoryState = {
      executionKey,
      identity: { ...identity },
      load: {
        status: 'pending',
        progress: null,
        stats: null,
      },
      stream: {
        status: 'idle',
        cursor: '',
      },
    };

    this._upsert(executionHistory);
    return executionHistory;
  }

  /** Starts loading an execution unless it is already loading or loaded. */
  startLoad(identity: ExecutionIdentity): ExecutionHistoryState | null {
    const executionKey = getExecutionKey(identity);
    const existingHistory = this._historiesByExecutionKey.get(executionKey);

    if (
      existingHistory?.load.status === 'loading' ||
      existingHistory?.load.status === 'loaded'
    ) {
      return null;
    }

    const executionHistory: ExecutionHistoryState = {
      executionKey,
      identity: existingHistory?.identity ?? { ...identity },
      load: {
        status: 'loading',
        progress: null,
        stats: null,
      },
      stream: existingHistory?.stream ?? {
        status: 'idle',
        cursor: '',
      },
    };

    this._upsert(executionHistory);
    return executionHistory;
  }

  /** Updates initial-load progress for an execution. */
  updateLoadProgress(
    executionKey: ExecutionKey,
    progress: BidirectionalProgress,
  ): void {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (executionHistory?.load.status !== 'loading') {
      return;
    }

    this._upsert({
      ...executionHistory,
      load: {
        ...executionHistory.load,
        progress,
      },
    });
  }

  /** Marks an execution's initial history load as complete. */
  completeLoad(executionKey: ExecutionKey, stats: BidirectionalStats): void {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (executionHistory?.load.status !== 'loading') {
      return;
    }

    this._upsert({
      ...executionHistory,
      load: {
        ...executionHistory.load,
        status: 'loaded',
        stats,
      },
    });
  }

  /** Marks an execution's initial history load as failed. */
  failLoad(executionKey: ExecutionKey): void {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (executionHistory?.load.status !== 'loading') {
      return;
    }

    this._upsert({
      ...executionHistory,
      load: {
        ...executionHistory.load,
        status: 'failed',
      },
    });
  }

  /** Starts live polling unless the execution is already being polled. */
  startStream(executionKey: ExecutionKey): ExecutionHistoryState | null {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (
      !executionHistory ||
      executionHistory.stream.status === 'polling' ||
      executionHistory.stream.status === 'retrying'
    ) {
      return null;
    }

    const updatedHistory: ExecutionHistoryState = {
      ...executionHistory,
      stream: {
        ...executionHistory.stream,
        status: 'polling',
      },
    };

    this._upsert(updatedHistory);
    return updatedHistory;
  }

  /** Updates the saved live-poll cursor for an execution. */
  updateStreamCursor(executionKey: ExecutionKey, cursor: string): void {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (!executionHistory || executionHistory.stream.cursor === cursor) {
      return;
    }

    this._upsert({
      ...executionHistory,
      stream: {
        ...executionHistory.stream,
        cursor,
      },
    });
  }

  /** Marks an execution's live poll as waiting to retry. */
  markStreamRetrying(executionKey: ExecutionKey): void {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (
      !executionHistory ||
      executionHistory.stream.status === 'retrying' ||
      executionHistory.stream.status === 'stopped'
    ) {
      return;
    }

    this._upsert({
      ...executionHistory,
      stream: {
        ...executionHistory.stream,
        status: 'retrying',
      },
    });
  }

  /** Marks an execution's live poll as actively polling. */
  markStreamPolling(executionKey: ExecutionKey): void {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (!executionHistory || executionHistory.stream.status === 'polling') {
      return;
    }

    this._upsert({
      ...executionHistory,
      stream: {
        ...executionHistory.stream,
        status: 'polling',
      },
    });
  }

  /** Marks an execution's live poll as stopped and saves its cursor. */
  stopStream(executionKey: ExecutionKey, cursor: string): void {
    const executionHistory = this._historiesByExecutionKey.get(executionKey);

    if (!executionHistory) {
      return;
    }

    this._upsert({
      ...executionHistory,
      stream: {
        status: 'stopped',
        cursor,
      },
    });
  }
}
