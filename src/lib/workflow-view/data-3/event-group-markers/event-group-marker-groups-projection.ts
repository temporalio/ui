import { getEventGroupMarkerReferences } from './get-event-group-marker-references';
import type {
  EventGroupMarkerGroup,
  EventGroupMarkerGroupMutable,
  EventGroupMarkerGroupsProjectionChange,
  EventGroupMarkerKey,
} from './types';
import type { NormalizedHistoryEvent } from '../history-events/types';
import { getLifecycleReference } from '../lifecycle-groups/get-lifecycle-reference';
import type { LifecycleReference } from '../lifecycle-groups/types';

export class EventGroupMarkerGroupsProjection {
  private _eventGroupMarkerGroups = new Map<
    EventGroupMarkerKey,
    EventGroupMarkerGroupMutable
  >();

  /** Updates marker attribution, returning null if no groups change. */
  addEvent(
    event: NormalizedHistoryEvent,
    lifecycleReference: LifecycleReference = getLifecycleReference(event),
  ): EventGroupMarkerGroupsProjectionChange[] | null {
    const changes: EventGroupMarkerGroupsProjectionChange[] = [];
    const references = getEventGroupMarkerReferences(event);

    for (const reference of references) {
      let group = this._eventGroupMarkerGroups.get(reference.key);

      if (!group) {
        group = {
          identity: reference.identity,
          marker: reference.marker,
          eventIds: new Set(),
          lifecycleHeadEventIds: new Set(),
          revision: 0,
        };

        this._eventGroupMarkerGroups.set(reference.key, group);
      }

      const isAddingEvent = !group.eventIds.has(event.eventId);
      const isAddingLifecycle = !group.lifecycleHeadEventIds.has(
        lifecycleReference.headEventId,
      );
      const isAddingLabelPayload =
        !group.marker.label?.label && !!reference.marker.label?.label;

      if (!isAddingEvent && !isAddingLifecycle && !isAddingLabelPayload) {
        continue;
      }

      group.eventIds.add(event.eventId);
      group.lifecycleHeadEventIds.add(lifecycleReference.headEventId);

      if (isAddingLabelPayload) {
        group.marker = reference.marker;
      }

      group.revision += 1;

      changes.push({
        type: 'EVENT_GROUP_MARKER_GROUP_CHANGED',
        eventGroupMarkerKey: reference.key,
      });
    }

    if (!changes.length) {
      return null;
    }

    return changes;
  }

  /** Returns a live readonly view of groups keyed by marker identity. */
  get eventGroupMarkerGroups(): ReadonlyMap<
    EventGroupMarkerKey,
    EventGroupMarkerGroup
  > {
    return this._eventGroupMarkerGroups;
  }
}
