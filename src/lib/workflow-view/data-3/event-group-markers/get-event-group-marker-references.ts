import { getEventGroupMarkerKey } from './get-key-from-marker';
import { normalizeEventGroupMarker } from './normalize-event-group-marker';
import type { EventGroupMarkerReference } from './types';
import type { NormalizedHistoryEvent } from '../history-events/types';

/** Resolves marker-group references recorded on a history event. */
export function getEventGroupMarkerReferences(
  event: NormalizedHistoryEvent,
): readonly EventGroupMarkerReference[] {
  const references: EventGroupMarkerReference[] = [];

  for (const rawMarker of event.eventGroupMarkers ?? []) {
    const marker = normalizeEventGroupMarker(rawMarker);

    if (!marker) {
      continue;
    }

    references.push({
      key: getEventGroupMarkerKey(marker),
      marker,
    });
  }

  return references;
}
