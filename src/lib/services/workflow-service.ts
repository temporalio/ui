import { sub, formatISO } from 'date-fns';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import type { ListWorkflowExecutionsResponse } from '$types';

type CombinedWorkflowExecutionsResponse = Pick<
  ListWorkflowExecutionsResponse,
  'executions'
> & {
  nextPageTokens: NextPageTokens;
};

type WorkflowType = 'open' | 'closed';
type VisibilityParameters = {
  startTime?: Duration;
  status?: WorkflowStatus;
};

const createDate = (d: Duration) => formatISO(sub(new Date(), d));

export const fetchWorkflowsByType = (
  namespace: string,
  type: WorkflowType,
  { startTime = { days: 90 }, status = null }: VisibilityParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  return requestFromAPI<ListWorkflowExecutionsResponse>(
    `/namespaces/${namespace}/workflows/${type}`,
    {
      params: {
        'start_time_filter.earliest_time': createDate(startTime),
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
    return {
      executions: [...open?.executions, ...closed?.executions],
      nextPageTokens: {
        open: open.nextPageToken,
        closed: closed.nextPageToken,
      },
    };
  });
};
