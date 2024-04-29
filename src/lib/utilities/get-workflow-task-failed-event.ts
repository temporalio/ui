import type { EventSortOrder } from '$lib/stores/event-view';
import type {
  WorkflowEvent,
  WorkflowEvents,
  WorkflowTaskCompletedEvent,
  WorkflowTaskFailedEvent,
} from '$lib/types/events';

const isFailedTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskFailedEvent => {
  return event.eventType === 'WorkflowTaskFailed';
};

const isCompletedTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskCompletedEvent => {
  return event.eventType === 'WorkflowTaskCompleted';
};

const getFailedWorkflowTask = (
  fullEventHistory: WorkflowEvents,
): WorkflowTaskFailedEvent | undefined => {
  const failedWorkflowTask = fullEventHistory.find((event) =>
    isFailedTaskEvent(event),
  ) as WorkflowTaskFailedEvent;
  const completedWorkflowTask = fullEventHistory.find((event) =>
    isCompletedTaskEvent(event),
  ) as WorkflowTaskCompletedEvent;

  const failedWorkflowTaskIndex = fullEventHistory.indexOf(failedWorkflowTask);
  const completedWorkflowTaskIndex = fullEventHistory.indexOf(
    completedWorkflowTask,
  );

  if (failedWorkflowTaskIndex < 0) return;
  if (completedWorkflowTaskIndex < 0 && failedWorkflowTaskIndex >= 0)
    return failedWorkflowTask;

  // History is sorted in descending order, so index of failed task should be less than index of completed task
  if (failedWorkflowTaskIndex < completedWorkflowTaskIndex) {
    return failedWorkflowTask;
  }
};

export const getWorkflowTaskFailedEvent = (
  fullEventHistory: WorkflowEvents,
  sortOrder: EventSortOrder,
): WorkflowTaskFailedEvent | undefined => {
  if (sortOrder === 'descending') {
    return getFailedWorkflowTask(fullEventHistory);
  } else {
    const reversedEventHistory = [...fullEventHistory].reverse();
    return getFailedWorkflowTask(reversedEventHistory);
  }
};
