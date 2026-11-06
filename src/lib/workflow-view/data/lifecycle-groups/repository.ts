import { getLifecycleReference } from './get-lifecycle-reference';
import type {
  LifecycleGroup,
  LifecycleGroupRepositoryNotification,
  LifecycleGroupRepositorySubscriber,
} from './types';
import type { QualifiedHistoryEvent } from '../history-events/types';
import {
  getEventKey,
  getLifecycleKey,
  type LifecycleKey,
} from '../identity-keys';

/** Stores lifecycle groups and publishes repository notifications. */
export class LifecycleGroupRepository {
  private _lifecycleGroupsByKey = new Map<LifecycleKey, LifecycleGroup>();
  private _subscribers = new Set<LifecycleGroupRepositorySubscriber>();

  /** Cached point-in-time group snapshot shared until repository state changes. */
  private _lifecycleGroupsSnapshotCache: readonly LifecycleGroup[] | null =
    null;

  /** Returns the current cached point-in-time lifecycle group snapshot. */
  getSnapshot(): readonly LifecycleGroup[] {
    if (this._lifecycleGroupsSnapshotCache) {
      return this._lifecycleGroupsSnapshotCache;
    }

    this._lifecycleGroupsSnapshotCache = [
      ...this._lifecycleGroupsByKey.values(),
    ];

    return this._lifecycleGroupsSnapshotCache;
  }

  /**
   * Adds an event to its lifecycle group without notifying subscribers.
   * @returns The upserted group, or `null` if the event is already present.
   */
  private _addEvent(event: QualifiedHistoryEvent): LifecycleGroup | null {
    const executionKey = event.executionKey;
    const lifecycleReference = getLifecycleReference(event);
    const headEventKey = getEventKey(
      executionKey,
      lifecycleReference.headEventId,
    );
    const lifecycleKey = getLifecycleKey(headEventKey);
    const existingGroup = this._lifecycleGroupsByKey.get(lifecycleKey);

    if (existingGroup?.eventKeys.includes(event.eventKey)) {
      return null;
    }

    const lifecycleGroup: LifecycleGroup = existingGroup
      ? {
          ...existingGroup,
          eventKeys: [...existingGroup.eventKeys, event.eventKey],
        }
      : {
          lifecycleKey,
          executionKey,
          headEventKey,
          kind: lifecycleReference.kind,
          eventKeys: [event.eventKey],
        };

    this._lifecycleGroupsByKey.set(lifecycleKey, lifecycleGroup);
    this._lifecycleGroupsSnapshotCache = null;
    return lifecycleGroup;
  }

  private _notifySubscribers(
    notification: LifecycleGroupRepositoryNotification,
  ): void {
    for (const subscriber of this._subscribers) {
      subscriber(notification);
    }
  }

  /**
   * Subscribe to lifecycle-group repository notifications.
   * @param options.emitCurrentSnapshot Emit the current group snapshot immediately after subscribing.
   * @returns Unsubscribe function.
   */
  subscribe(
    subscriber: LifecycleGroupRepositorySubscriber,
    options?: { emitCurrentSnapshot?: boolean },
  ): () => void {
    this._subscribers.add(subscriber);

    if (options?.emitCurrentSnapshot) {
      subscriber({
        type: 'LIFECYCLE_GROUPS_SNAPSHOT',
        groups: this.getSnapshot(),
      });
    }

    return () => {
      this._subscribers.delete(subscriber);
    };
  }

  /** Adds history events and publishes each lifecycle group that changed. */
  addEvents(events: readonly QualifiedHistoryEvent[]): void {
    const upsertedLifecycleGroups = new Map<LifecycleKey, LifecycleGroup>();

    for (const historyEvent of events) {
      const lifecycleGroup = this._addEvent(historyEvent);

      if (lifecycleGroup) {
        upsertedLifecycleGroups.set(
          lifecycleGroup.lifecycleKey,
          lifecycleGroup,
        );
      }
    }

    if (upsertedLifecycleGroups.size > 0) {
      this._notifySubscribers({
        type: 'LIFECYCLE_GROUPS_UPSERTED',
        groups: [...upsertedLifecycleGroups.values()],
      });
    }
  }
}
