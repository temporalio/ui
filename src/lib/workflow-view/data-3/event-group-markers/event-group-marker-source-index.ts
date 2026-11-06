import { getEventGroupMarkerSource } from './get-event-group-marker-source';
import { getEventGroupMarkerKey } from './get-key-from-marker';
import type {
  EventGroupMarkerDescriptor,
  EventGroupMarkerKey,
  EventGroupMarkerSource,
  KeyedEventGroupMarker,
  UpdateId,
} from './types';
import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';

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

/** Tracks marker source associations while keeping source events in canonical history. */
export class EventGroupMarkerSourceIndex {
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

  /** Registers a marker group's dependency on an inbound source event. */
  register(keyedMarker: KeyedEventGroupMarker): void {
    if (keyedMarker.marker.type === 'inbound-event') {
      this._inboundEventGroupKeys.set(
        keyedMarker.marker.eventId,
        keyedMarker.key,
      );
    }
  }

  /** Indexes source arrivals and returns potentially affected marker keys, without creating groups. */
  addEvent(event: NormalizedHistoryEvent): readonly EventGroupMarkerKey[] {
    const keys: EventGroupMarkerKey[] = [];
    const inboundEventGroupKey = this._inboundEventGroupKeys.get(event.eventId);
    if (inboundEventGroupKey) {
      keys.push(inboundEventGroupKey);
    }

    const updateId = getUpdateSourceId(event);
    if (!updateId) {
      return keys;
    }

    let sourceEventIds = this._updateSourceEventIdsByUpdateId.get(updateId);
    if (!sourceEventIds) {
      sourceEventIds = new Set();
      this._updateSourceEventIdsByUpdateId.set(updateId, sourceEventIds);
    }

    if (!sourceEventIds.has(event.eventId)) {
      sourceEventIds.add(event.eventId);
      keys.push(getEventGroupMarkerKey({ type: 'inbound-update', updateId }));
    }

    return keys;
  }

  /** Resolves source metadata lazily using the execution's current event lookup. */
  getSource(
    marker: EventGroupMarkerDescriptor,
    getEvent: (eventId: HistoryEventId) => NormalizedHistoryEvent | undefined,
  ): EventGroupMarkerSource | null {
    return getEventGroupMarkerSource(
      marker,
      getEvent,
      marker.type === 'inbound-update'
        ? this._updateSourceEventIdsByUpdateId.get(marker.updateId)
        : undefined,
    );
  }
}
