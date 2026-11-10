import type { WorkflowExecution } from '$lib/types/workflows';
import { isFuture } from '$lib/utilities/format-date';

import { getTimestampDifference } from './format-time';
import { getWorkflowCurrentTime } from './workflow-time-skipping';

export const isWorkflowDelayed = (workflow: WorkflowExecution): boolean => {
  if (!workflow.executionTime || !workflow.startTime) {
    return false;
  }

  const delay = getTimestampDifference(
    workflow.executionTime,
    workflow.startTime,
  );

  const workflowNow = getWorkflowCurrentTime(workflow);

  if (!delay || workflow.endTime || isFuture(workflow.startTime, workflowNow)) {
    return false;
  }

  return isFuture(workflow.executionTime, workflowNow);
};
