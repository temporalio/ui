import type { EventSortOrder } from '$lib/stores/event-view';
import type {
  WorkflowEvent,
  WorkflowEvents,
  WorkflowTaskFailedEvent,
} from '$lib/types/events';

const isFailedTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskFailedEvent => {
  return event.eventType === 'WorkflowTaskFailed';
};

export const getWorkflowTaskFailedEvent = (
  fullEventHistory: WorkflowEvents,
  sortOrder: EventSortOrder,
): WorkflowTaskFailedEvent | undefined => {
  if (sortOrder === 'descending') {
    return fullEventHistory.find((event) =>
      isFailedTaskEvent(event),
    ) as WorkflowTaskFailedEvent;
  } else {
    for (let i = fullEventHistory.length - 1; i >= 0; i--) {
      const event = fullEventHistory[i];
      if (isFailedTaskEvent(event)) return event;
    }
  }
};
