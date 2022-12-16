import type { StartAndEndEventHistory } from '$lib/stores/events';

export const isCancelInProgress = (
  status: WorkflowStatus,
  updating: boolean,
  eventHistory: StartAndEndEventHistory,
) => {
  const isRunning = status === 'Running';
  const workflowCancelRequested = eventHistory?.end?.some(
    (event) => event?.eventType === 'WorkflowExecutionCancelRequested',
  );
  return !updating && isRunning && workflowCancelRequested;
};
