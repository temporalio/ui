import type { EventGroupMarker } from '$lib/types/events';

import type { EventGroupMarkerDescriptor } from './types';

/** Converts an HTTP marker into one explicit attribution kind without decoding it. */
export function normalizeEventGroupMarker(
  marker: EventGroupMarker,
): EventGroupMarkerDescriptor | null {
  if (marker.label?.id) {
    const payload = marker.label.label;
    const hasPayloadContent = Boolean(
      payload?.data?.length || Object.keys(payload?.metadata ?? {}).length,
    );

    return {
      type: 'label',
      id: marker.label.id,
      payload: hasPayloadContent ? (payload ?? null) : null,
    };
  }

  const eventId = marker.inboundEvent?.inboundEventId;
  if (eventId != null) {
    return { type: 'inbound-event', eventId };
  }

  const updateId = marker.inboundUpdate?.inboundUpdateId;
  if (updateId) {
    return { type: 'inbound-update', updateId };
  }

  return null;
}
