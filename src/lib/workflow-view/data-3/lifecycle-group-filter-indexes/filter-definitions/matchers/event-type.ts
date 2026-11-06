import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../../types';

/** Matches groups containing a known event with one of the supplied types. */
export function getEventTypeMatcher(
  eventTypes: ReadonlySet<EventType>,
): Extract<
  LifecycleGroupFilterDefinition,
  { dependsOnExecutionDetails?: false }
>['matches'] {
  return (lifecycleGroup, getEvent) => {
    for (const eventId of lifecycleGroup.eventIds) {
      const eventType = getEvent(eventId)?.eventType;

      if (eventType && eventTypes.has(eventType)) {
        return true;
      }
    }

    return false;
  };
}
