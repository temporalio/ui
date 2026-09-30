import { toTimelineEventRow } from './to-timeline-event-row';
import type {
  TimelineEventRow,
  TimelineRowRepositoryNotification,
  TimelineRowRepositorySubscriber,
} from './types';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import type { EventKey, LifecycleKey } from '../../data/identity-keys';
import type { LifecycleGroup } from '../../data/lifecycle-groups/types';

/** Stores renderable timeline rows and publishes row notifications. */
export class TimelineRowRepository {
  private _rowsByKey = new Map<LifecycleKey, TimelineEventRow>();
  private _subscribers = new Set<TimelineRowRepositorySubscriber>();
  private _rowSnapshotCache: readonly TimelineEventRow[] | null = null;

  /** Returns the current cached point-in-time row snapshot. */
  getSnapshot(): readonly TimelineEventRow[] {
    if (this._rowSnapshotCache) {
      return this._rowSnapshotCache;
    }

    this._rowSnapshotCache = [...this._rowsByKey.values()];
    return this._rowSnapshotCache;
  }

  private _notifySubscribers(
    notification: TimelineRowRepositoryNotification,
  ): void {
    for (const subscriber of this._subscribers) {
      subscriber(notification);
    }
  }

  /**
   * Subscribe to timeline row repository notifications.
   * @param options.emitCurrentSnapshot Emit the current row snapshot immediately after subscribing.
   * @returns Unsubscribe function.
   */
  subscribe(
    subscriber: TimelineRowRepositorySubscriber,
    options?: { emitCurrentSnapshot?: boolean },
  ): () => void {
    this._subscribers.add(subscriber);

    if (options?.emitCurrentSnapshot) {
      subscriber({
        type: 'TIMELINE_ROWS_SNAPSHOT',
        rows: this.getSnapshot(),
      });
    }

    return () => {
      this._subscribers.delete(subscriber);
    };
  }

  /** Projects lifecycle groups and publishes each timeline row that changed. */
  upsertGroups(
    groups: readonly LifecycleGroup[],
    getEvent: (eventKey: EventKey) => QualifiedHistoryEvent | undefined,
  ): void {
    const upsertedRows: TimelineEventRow[] = [];

    for (const group of groups) {
      const row = toTimelineEventRow(group, getEvent);

      if (row) {
        this._rowsByKey.set(row.rowKey, row);
        this._rowSnapshotCache = null;
        upsertedRows.push(row);
      }
    }

    if (upsertedRows.length > 0) {
      this._notifySubscribers({
        type: 'TIMELINE_ROWS_UPSERTED',
        rows: upsertedRows,
      });
    }
  }
}
