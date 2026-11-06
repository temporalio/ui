import type { EventGroupMarkerDescriptor, EventGroupMarkerKey } from './types';

/** Creates an execution-local key from the marker's type-specific identifier. */
export function getEventGroupMarkerKey(
  marker: EventGroupMarkerDescriptor,
): EventGroupMarkerKey {
  switch (marker.type) {
    case 'label':
      return `event-group-marker:(${JSON.stringify({ type: marker.type, id: marker.id })})`;

    case 'inbound-event':
      return `event-group-marker:(${JSON.stringify({ type: marker.type, eventId: marker.eventId })})`;

    case 'inbound-update':
      return `event-group-marker:(${JSON.stringify({ type: marker.type, updateId: marker.updateId })})`;
  }
}
