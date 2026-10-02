import { getMarkerIdentity } from './get-marker-identity';
import type {
  EventMarkerGroup,
  EventMarkerGroupRepositoryNotification,
  EventMarkerGroupRepositorySubscriber,
  MutableEventMarkerGroup,
} from './types';
import type { QualifiedHistoryEvent } from '../history-events/types';
import {
  type EventMarkerGroupKey,
  getEventKey,
  getEventMarkerGroupKey,
  getLifecycleKey,
} from '../identity-keys';
import { getLifecycleReference } from '../lifecycle-groups/get-lifecycle-reference';

/** Indexes marker attribution without storing events or lifecycle groups. */
export class EventMarkerGroupRepository {
  private _groupsByKey = new Map<EventMarkerGroupKey, EventMarkerGroup>();
  private _subscribers = new Set<EventMarkerGroupRepositorySubscriber>();
  private _snapshot: readonly EventMarkerGroup[] | null = null;

  /** Returns the cached marker-group snapshot. */
  getSnapshot(): readonly EventMarkerGroup[] {
    if (!this._snapshot) {
      this._snapshot = Array.from(this._groupsByKey.values());
    }

    return this._snapshot;
  }

  /** Returns one marker group's attribution. */
  getGroup(key: EventMarkerGroupKey): EventMarkerGroup | undefined {
    return this._groupsByKey.get(key);
  }

  /** Observes changed groups; returns unsubscribe. */
  subscribe(
    subscriber: EventMarkerGroupRepositorySubscriber,
    options?: { emitCurrentSnapshot?: boolean },
  ): () => void {
    this._subscribers.add(subscriber);

    if (options?.emitCurrentSnapshot) {
      subscriber({
        type: 'EVENT_MARKER_GROUPS_SNAPSHOT',
        groups: this.getSnapshot(),
      });
    }

    return () => {
      this._subscribers.delete(subscriber);
    };
  }

  /** Indexes markers from history events and publishes changed groups. */
  addEvents(events: readonly QualifiedHistoryEvent[]): void {
    // working copies for event batch
    const changedGroups = new Map<
      EventMarkerGroupKey,
      MutableEventMarkerGroup
    >();

    for (const event of events) {
      if (!event.eventGroupMarkers?.length) {
        continue;
      }

      const reference = getLifecycleReference(event);
      const lifecycleKey = getLifecycleKey(
        getEventKey(event.executionKey, reference.headEventId),
      );

      for (const marker of event.eventGroupMarkers) {
        const identity = getMarkerIdentity(marker);

        if (!identity) {
          continue;
        }

        const markerGroupKey = getEventMarkerGroupKey(
          event.executionKey,
          identity,
        );

        let changedGroup = changedGroups.get(markerGroupKey);
        const existing = changedGroup ?? this._groupsByKey.get(markerGroupKey);

        if (existing?.eventKeys.has(event.eventKey)) {
          continue;
        }

        if (!changedGroup) {
          // copy-on-write
          changedGroup = {
            markerGroupKey,
            executionKey: event.executionKey,
            marker: existing?.marker ?? marker,
            eventKeys: new Set(existing?.eventKeys),
            lifecycleKeys: new Set(existing?.lifecycleKeys),
          };
          changedGroups.set(markerGroupKey, changedGroup);
        }

        // Only the first marker use needs a label payload; history may arrive out of order.
        if (!changedGroup.marker.label?.label && marker.label?.label) {
          changedGroup.marker = marker;
        }
        changedGroup.eventKeys.add(event.eventKey);
        changedGroup.lifecycleKeys.add(lifecycleKey);
      }
    }

    if (!changedGroups.size) {
      return;
    }

    // commit event batch working copies
    for (const [key, changedGroup] of changedGroups) {
      this._groupsByKey.set(key, changedGroup);
    }

    this._snapshot = null;
    this._notifySubscribers({
      type: 'EVENT_MARKER_GROUPS_UPSERTED',
      groups: Array.from(changedGroups.values()),
    });
  }

  private _notifySubscribers(
    notification: EventMarkerGroupRepositoryNotification,
  ): void {
    for (const subscriber of this._subscribers) {
      subscriber(notification);
    }
  }
}
