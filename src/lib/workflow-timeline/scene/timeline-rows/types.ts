import type {
  EventKey,
  ExecutionKey,
  LifecycleKey,
} from '../../data/identity-keys';
import type { LifecycleKind } from '../../data/lifecycle-groups/types';

/** Supported ordering directions for sibling timeline rows. */
export type TimelineRowOrder = 'ascending' | 'descending';

/** A renderable row representing one event lifecycle within an execution. */
export type TimelineEventRow = Readonly<{
  rowKey: LifecycleKey;
  executionKey: ExecutionKey;
  kind: LifecycleKind;
  eventKeys: readonly EventKey[];
  startEventId: string;
  endEventId: string;
  startTimeMs: number;
  endTimeMs: number;
}>;

/** Notifies subscribers that timeline rows were added or replaced. */
export type TimelineRowsUpsertedNotification = Readonly<{
  type: 'TIMELINE_ROWS_UPSERTED';
  rows: readonly TimelineEventRow[];
}>;

/** Provides a subscriber with the current timeline rows. */
export type TimelineRowsSnapshotNotification = Readonly<{
  type: 'TIMELINE_ROWS_SNAPSHOT';
  rows: readonly TimelineEventRow[];
}>;

/** A notification published by a timeline row repository. */
export type TimelineRowRepositoryNotification =
  | TimelineRowsSnapshotNotification
  | TimelineRowsUpsertedNotification;

/** Receives notifications from a timeline row repository. */
export type TimelineRowRepositorySubscriber = (
  notification: TimelineRowRepositoryNotification,
) => void;
