import { toDate } from './to-duration';
import { getStatusFilterCode } from './get-workflow-status-filter-code';

export const getWorkflowFilterParameters = ({
  workflowId,
  workflowType,
  timeRange,
  executionStatus,
}: FilterParameters = {}): Record<string, string> => {
  const params: Record<string, string> = {};
  const statusFilter = getStatusFilterCode(executionStatus);

  params['start_time_filter.earliest_time'] = toDate(
    timeRange || { hours: 24 },
  );

  if (workflowId) params['execution_filter.workflow_id'] = workflowId;
  if (workflowType) params['type_filter.name'] = workflowType;

  if (statusFilter) params['status_filter.status'] = statusFilter;

  return params;
};
