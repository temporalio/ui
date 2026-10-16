import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

import type { LifecycleGroupFilterDefinition } from '../types';

export const isLocalActivityCategory: LifecycleGroupFilterDefinition = {
  key: 'category:local-activity',
  matches: (group, getEvent) => {
    for (const eventId of group.eventIds) {
      const event = getEvent(eventId);

      if (event && isLocalActivityMarkerEvent(event)) {
        return true;
      }
    }

    return false;
  },
};
