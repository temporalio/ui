import type { WorkflowExecution } from '$lib/types/workflows';
import { isFuture } from '$lib/utilities/format-date';

import { getTimestampDifference } from './format-time';

export const isWorkflowDelayed = (workflow: WorkflowExecution): boolean => {
  if (!workflow.executionTime || !workflow.startTime) {
    return false;
  }

  const delay = getTimestampDifference(
    workflow.executionTime,
    workflow.startTime,
  );

  const workflowNow =
    workflow.workflowExtendedInfo?.timeSkippingInfo?.currentTime || new Date();

  if (!delay || workflow.endTime || isFuture(workflow.startTime, workflowNow)) {
    return false;
  }

  return isFuture(workflow.executionTime, workflowNow);
};
