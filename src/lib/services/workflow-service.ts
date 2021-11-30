import { sub, formatISO } from 'date-fns';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import type { ListWorkflowExecutionsResponse } from '$types';
import { toWorkflowExecutions } from '$lib/models/workflow-execution';
import { toDuration } from '$lib/utilities/to-duration';

type CombinedWorkflowExecutionsResponse = {
  workflows: ReturnType<typeof toWorkflowExecutions>;
  nextPageTokens: NextPageTokens;
};

type WorkflowType = 'open' | 'closed';
type VisibilityParameters = {
  timeRange?: Duration | string;
  status?: WorkflowStatus;
};

const createDate = (timeRange: Duration | string) => {
  let duration =
    typeof timeRange === 'string' ? toDuration(timeRange) : timeRange;
  return formatISO(sub(new Date(), duration));
};

export const fetchWorkflowsByType = (
  namespace: string,
  type: WorkflowType,
  { timeRange, status = null }: VisibilityParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  return requestFromAPI<ListWorkflowExecutionsResponse>(
    `/namespaces/${namespace}/workflows/${type}`,
    {
      params: {
        'start_time_filter.earliest_time': createDate(
          timeRange || { hours: 24 },
        ),
      },
      request,
    },
  );
};

export const fetchAllWorkflows = (
  namespace: string,
  parameters: VisibilityParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  return Promise.all([
    fetchWorkflowsByType(namespace, 'open', parameters, request),
    fetchWorkflowsByType(namespace, 'closed', parameters, request),
  ]).then(([open, closed]): CombinedWorkflowExecutionsResponse => {
    const executions = [...open?.executions, ...closed?.executions];
    return {
      workflows: toWorkflowExecutions({ executions }),
      nextPageTokens: {
        open: open.nextPageToken,
        closed: closed.nextPageToken,
      },
    };
  });
};
