import { getEventGroupMarkerReferences } from './get-event-group-marker-references';
import { getEventGroupMarkerKey } from './get-key-from-marker';
import type {
  EventGroupMarkerGroup,
  EventGroupMarkerGroupMutable,
  EventGroupMarkerGroupsProjectionChange,
  EventGroupMarkerKey,
  EventGroupMarkerReference,
  UpdateId,
} from './types';
import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';
import { getLifecycleReference } from '../lifecycle-groups/get-lifecycle-reference';
import type { LifecycleReference } from '../lifecycle-groups/types';

function getUpdateSourceId(event: NormalizedHistoryEvent): UpdateId | null {
  switch (event.eventType) {
    case 'WorkflowExecutionUpdateAdmitted':
      return (
        event.workflowExecutionUpdateAdmittedEventAttributes?.request?.meta
          ?.updateId || null
      );

    case 'WorkflowExecutionUpdateAccepted':
      return (
        event.workflowExecutionUpdateAcceptedEventAttributes?.acceptedRequest
          ?.meta?.updateId ||
        event.workflowExecutionUpdateAcceptedEventAttributes
          ?.protocolInstanceId ||
        null
      );

    default:
      return null;
  }
}

export class EventGroupMarkerGroupsProjection {
  private _eventGroupMarkerGroups = new Map<
    EventGroupMarkerKey,
    EventGroupMarkerGroupMutable
  >();
  /** Maps source event IDs to inbound-event groups to notify when the source arrives. */
  private _inboundEventGroupKeys = new Map<
    HistoryEventId,
    EventGroupMarkerKey
  >();
  /** Maps update IDs to admitted/accepted event IDs for lazy source-name lookup. */
  private _updateSourceEventIdsByUpdateId = new Map<
    UpdateId,
    Set<HistoryEventId>
  >();

  private _getOrCreateEventGroupMarkerGroup(
    reference: EventGroupMarkerReference,
  ): EventGroupMarkerGroupMutable {
    const existing = this._eventGroupMarkerGroups.get(reference.key);

    if (existing) {
      return existing;
    }

    const group: EventGroupMarkerGroupMutable = {
      marker: reference.marker,
      eventIds: new Set(),
      lifecycleHeadEventIds: new Set(),
      revision: 0,
    };

    this._eventGroupMarkerGroups.set(reference.key, group);

    if (reference.marker.type === 'inbound-event') {
      this._inboundEventGroupKeys.set(reference.marker.eventId, reference.key);
    }

    return group;
  }

  /** Updates attribution and source associations without copying source metadata. */
  addEvent(
    event: NormalizedHistoryEvent,
    lifecycleReference: LifecycleReference = getLifecycleReference(event),
  ): EventGroupMarkerGroupsProjectionChange[] | null {
    const updateId = getUpdateSourceId(event);
    const inboundEventGroupKey = this._inboundEventGroupKeys.get(event.eventId);

    const changedGroupKeys = new Set<EventGroupMarkerKey>();

    // A referenced event arriving later makes its source metadata available.
    if (inboundEventGroupKey) {
      changedGroupKeys.add(inboundEventGroupKey);
    }

    // Update markers reference an update ID, not a history event ID.
    if (updateId) {
      let sourceEventIds = this._updateSourceEventIdsByUpdateId.get(updateId);

      if (!sourceEventIds) {
        sourceEventIds = new Set();
        this._updateSourceEventIdsByUpdateId.set(updateId, sourceEventIds);
      }

      if (!sourceEventIds.has(event.eventId)) {
        sourceEventIds.add(event.eventId);
        const key = getEventGroupMarkerKey({
          type: 'inbound-update',
          updateId,
        });

        if (this._eventGroupMarkerGroups.has(key)) {
          changedGroupKeys.add(key);
        }
      }
    }

    // Explicit markers add membership; source associations above do not.
    for (const reference of getEventGroupMarkerReferences(event)) {
      const group = this._getOrCreateEventGroupMarkerGroup(reference);

      // Add event to group and track that the group was changed
      if (
        !group.eventIds.has(event.eventId) ||
        !group.lifecycleHeadEventIds.has(lifecycleReference.headEventId)
      ) {
        group.eventIds.add(event.eventId);
        group.lifecycleHeadEventIds.add(lifecycleReference.headEventId);
        changedGroupKeys.add(reference.key);
      }

      if (
        group.marker.type === 'label' &&
        reference.marker.type === 'label' &&
        group.marker.payload === null &&
        reference.marker.payload !== null
      ) {
        group.marker = reference.marker;
        changedGroupKeys.add(reference.key);
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

  /** Returns source event IDs by update ID; source events remain in the execution's history. */
  get updateSourceEventIds(): ReadonlyMap<
    UpdateId,
    ReadonlySet<HistoryEventId>
  > {
    return this._updateSourceEventIdsByUpdateId;
  }

  /** Returns a live readonly view of groups keyed by marker identity. */
  get eventGroupMarkerGroups(): ReadonlyMap<
    EventGroupMarkerKey,
    EventGroupMarkerGroup
  > {
    return this._eventGroupMarkerGroups;
  }
}
