import type { WorkflowExecution } from '$lib/models/workflow-execution';

import { eventTypeInCategory } from './get-event-categorization';
import { isEventGroups } from './get-event-classification';

export function getVisibleEvents(
  events: CompactEventGroups,
  workflow: never,
  category: never,
): CompactEventGroups;

export function getVisibleEvents(
  events: HistoryEventWithId[],
  workflow: WorkflowExecution,
  category: EventTypeCategory,
): EventsOrActivities;

export function getVisibleEvents(
  events: HistoryEventWithId[] | CompactEventGroups,
  workflow: WorkflowExecution,
  category: EventTypeCategory,
): IterableEvents {
  if (isEventGroups(events)) return events;

  const pendingActivities = workflow.pendingActivities;
  const visibleEvents = events.filter(eventTypeInCategory(category));

  return [...pendingActivities, ...visibleEvents];
}
