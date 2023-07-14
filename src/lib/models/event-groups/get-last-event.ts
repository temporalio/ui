import type { WorkflowEvent } from '$lib/types/events';

import type { EventGroup } from './event-groups';

export const getLastEvent = ({ events }: EventGroup): WorkflowEvent => {
  let latestEventKey = 0;
  let result: WorkflowEvent;

  for (const event of events.values()) {
    const k = Number(event.id);
    if (k >= latestEventKey) {
      latestEventKey = k;
      result = event;
    }
  }

  return result;
};
