import type { EventType } from '$lib/types/events';
import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

import type { LifecycleGroupFilterDefinition } from '../types';

const otherCategoryEventTypes = new Set<EventType>([
  'MarkerRecorded',
  'UpsertWorkflowSearchAttributes',
  'WorkflowPropertiesModified',
]);

export const isOtherCategory: LifecycleGroupFilterDefinition = {
  key: 'category:other',
  matches: (group, getEvent) => {
    for (const eventId of group.eventIds) {
      const event = getEvent(eventId);

      if (
        event &&
        otherCategoryEventTypes.has(event.eventType) &&
        !isLocalActivityMarkerEvent(event)
      ) {
        return true;
      }
    }

    return false;
  },
};
