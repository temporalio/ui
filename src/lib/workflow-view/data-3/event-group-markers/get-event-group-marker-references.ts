import { getEventGroupMarkerIdentity } from './get-identity';
import { getEventGroupMarkerKeyFromIdentity } from './get-key-from-identity';
import type { EventGroupMarkerReference } from './types';
import type { NormalizedHistoryEvent } from '../history-events/types';

/** Resolves marker-group references recorded on a history event. */
export function getEventGroupMarkerReferences(
  event: NormalizedHistoryEvent,
): readonly EventGroupMarkerReference[] {
  const references: EventGroupMarkerReference[] = [];

  for (const marker of event.eventGroupMarkers ?? []) {
    const identity = getEventGroupMarkerIdentity(marker);

    if (!identity) {
      continue;
    }

    references.push({
      key: getEventGroupMarkerKeyFromIdentity(identity),
      identity,
      marker,
    });
  }

  return references;
}
