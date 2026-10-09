import type { EventGroupMarker } from '$lib/types/events';

import type { EventGroupMarkerIdentity } from './types';

/** Returns a marker's opaque identity without decoding its label. */
export function getEventGroupMarkerIdentity(
  marker: EventGroupMarker,
): EventGroupMarkerIdentity | null {
  if (marker.label?.id) {
    return { type: 'label', id: marker.label.id };
  }

  const inboundEventId = marker.inboundEvent?.inboundEventId;
  if (inboundEventId != null) {
    return { type: 'inbound-event', id: inboundEventId };
  }

  if (marker.inboundUpdate?.inboundUpdateId) {
    return {
      type: 'inbound-update',
      id: marker.inboundUpdate.inboundUpdateId,
    };
  }

  return null;
}
