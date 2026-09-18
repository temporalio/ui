import type {
  BidirectionalProgress,
  BidirectionalStats,
} from '$lib/services/fetch-bidirectional';

import type { ExecutionIdentity, ExecutionKey } from '../identity-keys';

/** Initial history loading state for one workflow execution. */
export type ExecutionHistoryLoadState = Readonly<{
  status: 'pending' | 'loading' | 'loaded' | 'failed';
  progress: BidirectionalProgress | null;
  stats: BidirectionalStats | null;
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
