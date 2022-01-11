import type { WorkflowExecution } from '$lib/models/workflow-execution';
import { eventTypeInCategory } from './get-event-categorization';

export const getVisibleEvents = async (
  eventsRequest: EventualHistoryEvents,
  workflowRequest: PromiseLike<WorkflowExecution>,
  category: EventTypeCategory,
): Promise<(HistoryEventWithId | PendingActivity)[]> => {
  const events = await eventsRequest;
  const workflow = await workflowRequest;
  const pendingActivities = workflow.pendingActivities;
  const visibleEvents = events.filter(eventTypeInCategory(category));

  return [...pendingActivities, ...visibleEvents];
};
