import { get } from 'svelte/store';

import { temporalVersion } from '$lib/stores/versions';
import type { WorkflowExecutionStatus } from '$lib/types';
import type { WorkflowStatus } from '$lib/types/workflows';

import { isVersionNewer } from './version-check';

const noScreamingEnums = () => isVersionNewer('1.22', get(temporalVersion));

export const toWorkflowStatusReadable = (
  status: WorkflowExecutionStatus | WorkflowStatus,
): WorkflowStatus => {
  // CHANGE THIS TO 1.23 BEFORE MERGING. NEED 1.22 TO TEST
  if (noScreamingEnums()) return status as WorkflowStatus;

  const statusMap = {
    WORKFLOW_EXECUTION_STATUS_UNSPECIFIED: '',
    WORKFLOW_EXECUTION_STATUS_RUNNING: 'Running',
    WORKFLOW_EXECUTION_STATUS_COMPLETED: 'Completed',
    WORKFLOW_EXECUTION_STATUS_FAILED: 'Failed',
    WORKFLOW_EXECUTION_STATUS_CANCELED: 'Canceled',
    WORKFLOW_EXECUTION_STATUS_TERMINATED: 'Terminated',
    WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW: 'ContinuedAsNew',
    WORKFLOW_EXECUTION_STATUS_TIMED_OUT: 'TimedOut',
  };
  return statusMap[status];
};
