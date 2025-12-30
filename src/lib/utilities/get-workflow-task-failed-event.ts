import type { EventSortOrder } from '$lib/stores/event-view';
import type { WorkflowTaskFailedEventAttributes } from '$lib/types';
import type {
  HistoryEvent,
  WorkflowEvent,
  WorkflowEvents,
  WorkflowTaskCompletedEvent,
  WorkflowTaskFailedEvent,
  WorkflowTaskTimedOutEvent,
} from '$lib/types/events';
import type { WorkflowTaskFailedCause } from '$lib/types/workflows';

import { isPureWorkflowTaskFailedEvent } from './is-event-type';
import { toWorkflowTaskFailureReadable } from './screaming-enums';

export const isFailedTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskFailedEvent => {
  return event.eventType === 'WorkflowTaskFailed';
};

export const isTimedOutTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskTimedOutEvent => {
  return event.eventType === 'WorkflowTaskTimedOut';
};

const isCompletedTaskEvent = (
  event: WorkflowEvent,
): event is WorkflowTaskCompletedEvent => {
  return event.eventType === 'WorkflowTaskCompleted';
};

export const isWorkflowTaskFailedEventDueToReset = (
  event: WorkflowEvent | HistoryEvent,
): boolean =>
  isPureWorkflowTaskFailedEvent(event) &&
  getErrorCause(event) === 'ResetWorkflow';

export const getErrorCause = (
  error: WorkflowTaskFailedEvent | WorkflowTaskTimedOutEvent,
): WorkflowTaskFailedCause => {
  if (isTimedOutTaskEvent(error)) return 'WorkflowTaskTimedOut';

  const { workflowTaskFailedEventAttributes: { failure, cause } = {} } =
    error as WorkflowTaskFailedEvent & {
      workflowTaskFailedEventAttributes: WorkflowTaskFailedEventAttributes;
    };

  if (failure?.applicationFailureInfo?.type === 'workflowTaskHeartbeatError') {
    return 'WorkflowTaskHeartbeatError';
  }

  return toWorkflowTaskFailureReadable(cause);
};

const getFailedWorkflowTask = (
  fullEventHistory: WorkflowEvents,
): WorkflowTaskFailedEvent | WorkflowTaskTimedOutEvent | undefined => {
  const failedWorkflowTaskIndex = fullEventHistory.findIndex(isFailedTaskEvent);
  const timedOutWorkflowTaskIndex =
    fullEventHistory.findIndex(isTimedOutTaskEvent);
  const failedWorkflowIndex =
    failedWorkflowTaskIndex < 0
      ? timedOutWorkflowTaskIndex
      : failedWorkflowTaskIndex;

  if (failedWorkflowIndex < 0) return;

  const completedWorkflowTaskIndex =
    fullEventHistory.findIndex(isCompletedTaskEvent);
  const failedWorkflowTask = fullEventHistory[failedWorkflowIndex] as
    | WorkflowTaskFailedEvent
    | WorkflowTaskTimedOutEvent;
  const cause = getErrorCause(failedWorkflowTask);

  if (cause === 'ResetWorkflow') return;

  if (completedWorkflowTaskIndex < 0) return failedWorkflowTask;

  // History is sorted in descending order, so index of failed task should be less than index of completed task
  if (failedWorkflowIndex < completedWorkflowTaskIndex) {
    return failedWorkflowTask;
  }
};

export const getWorkflowTaskFailedEvent = (
  fullEventHistory: WorkflowEvents,
  sortOrder: EventSortOrder,
): WorkflowTaskFailedEvent | WorkflowTaskTimedOutEvent | undefined => {
  if (sortOrder === 'descending') {
    return getFailedWorkflowTask(fullEventHistory);
  } else {
    const reversedEventHistory = [...fullEventHistory].reverse();
    return getFailedWorkflowTask(reversedEventHistory);
  }
};
