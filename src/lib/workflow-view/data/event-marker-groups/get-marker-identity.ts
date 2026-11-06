import type { EventGroupMarker } from './types';
import type { EventMarkerIdentity } from '../identity-keys';

/** Resolves a marker's opaque identity without decoding its label. */
export function getMarkerIdentity(
  marker: EventGroupMarker,
): EventMarkerIdentity | undefined {
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

  return undefined;
}
