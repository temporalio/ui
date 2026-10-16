import type { EventGroupMarkerIdentity, EventGroupMarkerKey } from './types';

/** Creates an execution-local key for a marker identity. */
export function getEventGroupMarkerKeyFromIdentity(
  identity: EventGroupMarkerIdentity,
): EventGroupMarkerKey {
  return `event-group-marker:(${JSON.stringify({ type: identity.type, id: identity.id })})`;
}
