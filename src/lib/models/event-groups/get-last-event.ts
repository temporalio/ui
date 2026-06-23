import type { WorkflowEvent } from '$lib/types/events';

import type { EventGroup } from './event-groups';

export const getLastEvent = ({ eventList }: EventGroup): WorkflowEvent =>
  eventList[eventList.length - 1];
