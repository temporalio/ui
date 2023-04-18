import type { StartAndEndEventHistory } from '$lib/stores/events';
import type { WorkflowStatus } from '$lib/types/workflows';

export const isCancelInProgress = (
  status: WorkflowStatus,
  eventHistory: StartAndEndEventHistory,
) => {
  const isRunning = status === 'Running';
  const workflowCancelRequested = eventHistory?.end?.some(
    (event) => event?.eventType === 'WorkflowExecutionCancelRequested',
  );
  return isRunning && workflowCancelRequested;
};
