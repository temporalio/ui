import type { WorkflowExecutionStatus } from '$lib/types';
import type { WorkflowStatus } from '$lib/types/workflows';

export const toWorkflowStatusReadable = (
  status: WorkflowExecutionStatus | WorkflowStatus,
): WorkflowStatus => {
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
  return statusMap?.[status] ?? status;
};

export const toNamespaceStatusReadable = (status: string): string => {
  const statusMap = {
    ARCHIVAL_STATE_UNSPECIFIED: '',
    ARCHIVAL_STATE_DISABLED: 'Disabled',
    ARCHIVAL_STATE_ENABLED: 'Enabled',
  };
  return statusMap[status];
};
