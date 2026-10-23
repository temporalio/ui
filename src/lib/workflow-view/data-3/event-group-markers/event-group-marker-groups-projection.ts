import { EventGroupMarkerSourceIndex } from './event-group-marker-source-index';
import { getKeyedEventGroupMarkers } from './get-keyed-event-group-markers';
import type {
  EventGroupMarkerDescriptor,
  EventGroupMarkerGroup,
  EventGroupMarkerGroupMutable,
  EventGroupMarkerGroupsProjectionChange,
  EventGroupMarkerKey,
  EventGroupMarkerSource,
  KeyedEventGroupMarker,
} from './types';
import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';
import { getLifecycleIdentity } from '../lifecycle-groups/get-lifecycle-identity';
import type { LifecycleIdentity } from '../lifecycle-groups/types';

export class EventGroupMarkerGroupsProjection {
  private _eventGroupMarkerGroups = new Map<
    EventGroupMarkerKey,
    EventGroupMarkerGroupMutable
  >();
  private _sourceIndex = new EventGroupMarkerSourceIndex();

  private _getOrCreateEventGroupMarkerGroup(
    keyedMarker: KeyedEventGroupMarker,
  ): EventGroupMarkerGroupMutable {
    const existing = this._eventGroupMarkerGroups.get(keyedMarker.key);
    if (existing) {
      return existing;
    }

    const group: EventGroupMarkerGroupMutable = {
      marker: keyedMarker.marker,
      eventIds: new Set(),
      lifecycleHeadEventIds: new Set(),
      revision: 0,
    };
    this._eventGroupMarkerGroups.set(keyedMarker.key, group);
    this._sourceIndex.register(keyedMarker);
    return group;
  }

  /** Updates attribution and source associations without copying source metadata. */
  addEvent(
    event: NormalizedHistoryEvent,
    lifecycleIdentity: LifecycleIdentity = getLifecycleIdentity(event),
  ): EventGroupMarkerGroupsProjectionChange[] | null {
    const changedGroupKeys = new Set<EventGroupMarkerKey>();

    // Source arrivals affect existing groups but do not create membership.
    for (const key of this._sourceIndex.addEvent(event)) {
      if (this._eventGroupMarkerGroups.has(key)) {
        changedGroupKeys.add(key);
      }
    }

    // Explicit markers add membership; source associations above do not.
    for (const keyedMarker of getKeyedEventGroupMarkers(event)) {
      const group = this._getOrCreateEventGroupMarkerGroup(keyedMarker);

      // Add event to group and track that the group was changed
      if (
        !group.eventIds.has(event.eventId) ||
        !group.lifecycleHeadEventIds.has(lifecycleIdentity.headEventId)
      ) {
        group.eventIds.add(event.eventId);
        group.lifecycleHeadEventIds.add(lifecycleIdentity.headEventId);
        changedGroupKeys.add(keyedMarker.key);
      }

      if (
        group.marker.type === 'label' &&
        keyedMarker.marker.type === 'label' &&
        group.marker.payload === null &&
        keyedMarker.marker.payload !== null
      ) {
        group.marker = keyedMarker.marker;
        changedGroupKeys.add(keyedMarker.key);
      }
    }

    // Source arrival and membership changes produce one change per group.
    const changes: EventGroupMarkerGroupsProjectionChange[] = [];
    for (const key of changedGroupKeys) {
      const group = this._eventGroupMarkerGroups.get(key);
      if (!group) {
        throw new Error(`Missing event group marker group ${key}`);
      }
      group.revision += 1;
      changes.push({
        type: 'EVENT_GROUP_MARKER_GROUP_CHANGED',
        eventGroupMarkerKey: key,
      });
    }

    return changes.length ? changes : null;
  }

  /** Resolves source metadata through the source index without retaining a copy. */
  getSource(
    marker: EventGroupMarkerDescriptor,
    getEvent: (eventId: HistoryEventId) => NormalizedHistoryEvent | undefined,
  ): EventGroupMarkerSource | null {
    return this._sourceIndex.getSource(marker, getEvent);
  }

  /** Returns a live readonly view of groups keyed by marker identity. */
  get eventGroupMarkerGroups(): ReadonlyMap<
    EventGroupMarkerKey,
    EventGroupMarkerGroup
  > {
    return this._eventGroupMarkerGroups;
  }
}
