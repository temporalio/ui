import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';

import type {
  EventGroupMarkerDescriptor,
  EventGroupMarkerSource,
} from './types';

function formatSourceName(
  source: EventGroupMarkerSource | null,
  id: string,
): string {
  if (source?.name) {
    return `${source.name} (${id})`;
  }

  return source?.eventType || id;
}

/** Resolves display text by marker kind, decoding explicit labels only when requested. */
export async function getEventGroupMarkerName(
  marker: EventGroupMarkerDescriptor,
  getSource: (
    marker: EventGroupMarkerDescriptor,
  ) => EventGroupMarkerSource | null,
): Promise<string> {
  switch (marker.type) {
    case 'label': {
      if (!marker.payload) {
        return marker.id;
      }

      try {
        const decoded = await decodePayloadAndParseDataToJSON(marker.payload);
        return typeof decoded === 'string' && decoded ? decoded : marker.id;
      } catch {
        return marker.id;
      }
    }

    case 'inbound-event':
      return formatSourceName(getSource(marker), marker.eventId);

    case 'inbound-update':
      return formatSourceName(getSource(marker), marker.updateId);
  }
}
