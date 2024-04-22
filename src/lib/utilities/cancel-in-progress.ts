import type { WorkflowEvents } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

export const isCancelInProgress = (
  status: WorkflowStatus,
  eventHistory: WorkflowEvents,
) => {
  const isRunning = status === 'Running';
  const workflowCancelRequested = eventHistory?.some(
    (event) => event?.eventType === 'WorkflowExecutionCancelRequested',
  );
  return isRunning && workflowCancelRequested;
};
