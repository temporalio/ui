import type {
  EventGroupMarkerDescriptor,
  EventGroupMarkerSource,
} from './types';
import { compareEventIds } from '../history-events/compare-event-ids';
import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';

function getUpdateName(event: NormalizedHistoryEvent): string | null {
  switch (event.eventType) {
    case 'WorkflowExecutionUpdateAdmitted':
      return (
        event.workflowExecutionUpdateAdmittedEventAttributes?.request?.input
          ?.name || null
      );

    case 'WorkflowExecutionUpdateAccepted':
      return (
        event.workflowExecutionUpdateAcceptedEventAttributes?.acceptedRequest
          ?.input?.name || null
      );

    default:
      return null;
  }
}

/** Resolves inbound source metadata on demand; explicit labels have no source event. */
export function getEventGroupMarkerSource(
  marker: EventGroupMarkerDescriptor,
  getEvent: (eventId: HistoryEventId) => NormalizedHistoryEvent | undefined,
  updateSourceEventIds: Iterable<HistoryEventId> = [],
): EventGroupMarkerSource | null {
  switch (marker.type) {
    case 'label':
      return null;

    case 'inbound-event': {
      const event = getEvent(marker.eventId);
      if (!event) {
        return null;
      }

      return {
        eventId: event.eventId,
        eventType: event.eventType,
        name:
          event.workflowExecutionSignaledEventAttributes?.signalName || null,
      };
    }

    case 'inbound-update': {
      let firstEvent: NormalizedHistoryEvent | undefined;
      let namedEvent: NormalizedHistoryEvent | undefined;

      for (const eventId of updateSourceEventIds) {
        const event = getEvent(eventId);
        if (!event) {
          continue;
        }

        if (
          !firstEvent ||
          compareEventIds(event.eventId, firstEvent.eventId) < 0
        ) {
          firstEvent = event;
        }

        if (
          getUpdateName(event) &&
          (!namedEvent ||
            compareEventIds(event.eventId, namedEvent.eventId) < 0)
        ) {
          namedEvent = event;
        }
      }

      if (!firstEvent) {
        return null;
      }

      return {
        eventId: firstEvent.eventId,
        eventType: firstEvent.eventType,
        name: namedEvent ? getUpdateName(namedEvent) : null,
      };
    }
  }
}
