import { sub, formatISO } from 'date-fns';

import type {
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';

const base = import.meta.env.VITE_API;
const id = <T>(x: T) => x;
const createDate = (d: Duration) => formatISO(sub(new Date(), d));

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

type FetchWorkflows<T> = NamespaceScopedRequest & {
  onUpdate?: (results: Omit<T, 'nextPageToken'>) => void;
  startTime?: Duration;
  request?: typeof fetch;
};

type FetchEvents = FetchWorkflows<GetWorkflowExecutionHistoryResponse> & {
  executionId: string;
  runId: string;
};

const fetchWorkflows =
  (type: 'open' | 'closed') =>
  async (
    {
      namespace,
      onUpdate = id,
      startTime = { days: 1 },
    }: FetchWorkflows<ListWorkflowExecutionsResponse>,
    request = fetch,
  ): Promise<ListWorkflowExecutionsResponse> => {
    return await paginated(
      async (token: string) => {
        return requestFromAPI<ListWorkflowExecutionsResponse>(
          `/namespaces/${namespace}/workflows/${type}`,
          {
            next_page_token: token,
            'start_time_filter.earliest_time': createDate(startTime),
          },
          { request },
        );
      },
      { onUpdate },
    );
  };

export const fetchAllWorkflows = async (
  options: FetchWorkflows<ListWorkflowExecutionsResponse>,
) => {
  const open = await fetchWorkflows('open')(options);
  const closed = await fetchWorkflows('closed')(options);

  return { ...open.executions, ...closed.executions };
};

export async function fetchWorkflow(
  { executionId, runId, namespace }: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<DescribeWorkflowExecutionResponse> {
  return requestFromAPI(
    `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
    {},
    { request },
  );
}

export const fetchEvents = async (
  { namespace, executionId, runId, onUpdate = id }: FetchEvents,
  request = fetch,
) => {
  const events: GetWorkflowExecutionHistoryResponse = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}/events`,
        {
          next_page_token: token,
        },
        { request },
      );
    },
    { onUpdate },
  );

  return events;
};
