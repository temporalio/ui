import { WORKFLOW_RESET_REASON } from '$lib/services/workflow-service';
import type { StartAndEndEventHistory } from '$lib/stores/events';
import { has } from './has';

export const hasBeenReset = (
  workflowStatus: WorkflowStatus,
  eventHistory: StartAndEndEventHistory,
): boolean => {
  return (
    workflowStatus === 'Terminated' &&
    eventHistory.end[0] !== undefined &&
    has(eventHistory.end[0].attributes, 'reason') &&
    eventHistory.end[0].attributes['reason'] === WORKFLOW_RESET_REASON
  );
};
