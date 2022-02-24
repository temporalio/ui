import type { WorkflowExecution } from '$lib/models/workflow-execution';

import { eventTypeInCategory } from './get-event-categorization';
import { isEventGroups } from './get-event-classification';

export const getVisibleEvents = (
  eventsRequest: HistoryEventWithId[] | CompactEventGroups,
  workflowRequest: WorkflowExecution,
  category: EventTypeCategory,
): (HistoryEventWithId | PendingActivity)[] | CompactEventGroup[] => {
  if (isEventGroups(eventsRequest)) return eventsRequest;

  const events = eventsRequest;
  const workflow = workflowRequest;
  const pendingActivities = workflow.pendingActivities;
  const visibleEvents = events.filter(eventTypeInCategory(category));

  [...pendingActivities, ...visibleEvents];
};
