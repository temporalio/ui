import { getEventGroupMarkerKey } from './get-key-from-marker';
import { normalizeEventGroupMarker } from './normalize-event-group-marker';
import type { KeyedEventGroupMarker } from './types';
import type { NormalizedHistoryEvent } from '../history-events/types';

/** Normalizes history markers and pairs each with its execution-local key. */
export function getKeyedEventGroupMarkers(
  event: NormalizedHistoryEvent,
): readonly KeyedEventGroupMarker[] {
  const keyedMarkers: KeyedEventGroupMarker[] = [];

  for (const rawMarker of event.eventGroupMarkers ?? []) {
    const marker = normalizeEventGroupMarker(rawMarker);

    if (!marker) {
      continue;
    }

    keyedMarkers.push({
      key: getEventGroupMarkerKey(marker),
      marker,
    });
  }

  return keyedMarkers;
}
