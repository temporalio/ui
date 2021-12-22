import { formatISO, sub } from 'date-fns';

import { toDuration } from './to-duration';
import { getStatusFilterCode } from './get-workflow-status-filter-code';

const createDate = (timeRange: Duration | string) => {
  const duration =
    typeof timeRange === 'string' ? toDuration(timeRange) : timeRange;
  return formatISO(sub(new Date(), duration));
};

export const getWorkflowFilterParameters = ({
  workflowId,
  workflowType,
  timeRange,
  status,
}: FilterParameters = {}): Record<string, string> => {
  const params: Record<string, string> = {};
  const statusFilter = getStatusFilterCode(status);

  params['start_time_filter.earliest_time'] = createDate(
    timeRange || { hours: 24 },
  );

  if (workflowId) params['execution_filter.workflow_id'] = workflowId;
  if (workflowType) params['type_filter.name'] = workflowType;

  if (statusFilter) params['status_filter.status'] = statusFilter;

  return params;
};
