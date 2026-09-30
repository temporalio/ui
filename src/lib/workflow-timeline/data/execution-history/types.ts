import type { ExecutionIdentity, ExecutionKey } from '../identity-keys';

/** Progress while fetching an execution's existing history. */
export type ExecutionHistoryLoadProgress = Readonly<{
  ascPages: number;
  descPages: number;
  eventsAdded: number;
  elapsedMs: number;
}>;

/** Results from fetching an execution's existing history. */
export type ExecutionHistoryLoadStats = Readonly<{
  durationMs: number;
  eventsAdded: number;
  ascPages: number;
  descPages: number;
}>;

/** Initial history loading state for one workflow execution. */
export type ExecutionHistoryLoadState = Readonly<{
  status: 'pending' | 'loading' | 'loaded' | 'failed';
  progress: ExecutionHistoryLoadProgress | null;
  stats: ExecutionHistoryLoadStats | null;
}>;

/** Live history polling state for one workflow execution. */
export type ExecutionHistoryStreamState = Readonly<{
  status: 'idle' | 'polling' | 'retrying' | 'stopped';
  cursor: string;
}>;

/** Loading and streaming state for one workflow execution history. */
export type ExecutionHistoryState = Readonly<{
  executionKey: ExecutionKey;
  identity: ExecutionIdentity;
  load: ExecutionHistoryLoadState;
  stream: ExecutionHistoryStreamState;
}>;

/** Notifies subscribers that execution history states were added or replaced. */
export type ExecutionHistoriesUpsertedNotification = Readonly<{
  type: 'EXECUTION_HISTORIES_UPSERTED';
  executionHistories: readonly ExecutionHistoryState[];
}>;

/** Provides a subscriber with the current execution history states. */
export type ExecutionHistoriesSnapshotNotification = Readonly<{
  type: 'EXECUTION_HISTORIES_SNAPSHOT';
  executionHistories: readonly ExecutionHistoryState[];
}>;

/** A notification published by an execution history repository. */
export type ExecutionHistoryRepositoryNotification =
  | ExecutionHistoriesSnapshotNotification
  | ExecutionHistoriesUpsertedNotification;

/** Receives notifications from an execution history repository. */
export type ExecutionHistoryRepositorySubscriber = (
  notification: ExecutionHistoryRepositoryNotification,
) => void;
