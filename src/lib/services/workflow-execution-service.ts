import { sub, formatISO } from 'date-fns';

import { paginated } from '$lib/utilities/paginated';
import { toURL } from '$lib/utilities/to-url';
import type {
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types';

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
    const response = await paginated(
      async (token: string) => {
        const url = toURL(`${base}/namespaces/${namespace}/workflows/${type}`, {
          next_page_token: token,
          'start_time_filter.earliest_time': createDate(startTime),
        });

        const response = await request(url);
        return await response.json();
      },
      { onUpdate },
    );

    return response;
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
): Promise<{
  execution: DescribeWorkflowExecutionResponse;
}> {
  const url = toURL(
    `${base}/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
  );

  const execution: DescribeWorkflowExecutionResponse = await request(url)
    .then((response) => response.json())
    .catch(console.error);

  return {
    execution,
  };
}

export const fetchEvents = async (
  { namespace, executionId, runId, onUpdate = id }: FetchEvents,
  request = fetch,
) => {
  const events: GetWorkflowExecutionHistoryResponse = await paginated(
    async (token: string) => {
      const url = toURL(
        `${base}/namespaces/${namespace}/workflows/${executionId}/executions/${runId}/events`,
        {
          next_page_token: token,
        },
      );

      const response = await request(url);
      return await response.json();
    },
    { onUpdate },
  );

  return events;
};
