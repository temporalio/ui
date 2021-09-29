import { sub, formatISO } from 'date-fns';

import { paginated } from '$lib/utilities/paginated';
import { toURL } from '$lib/utilities/to-url';
import type {
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types';

const base = import.meta.env.VITE_API;

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
      onUpdate = (x) => x,
      startTime = { days: 1 },
    }: FetchWorkflows<ListWorkflowExecutionsResponse>,
    request = fetch,
  ) => {
    const { executions } = await paginated(
      async (token: string) => {
        const iso = formatISO(sub(new Date(), startTime));
        const url = toURL(`${base}/namespaces/${namespace}/workflows/${type}`, {
          next_page_token: token,
          'start_time_filter.earliest_time': iso,
        });

        const response = await request(url);
        return await response.json();
      },
      { onUpdate },
    );

    return executions;
  };

export const fetchEvents = async (
  { namespace, executionId, runId, onUpdate = (x) => x }: FetchEvents,
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

export const fetchOpenWorkflows = fetchWorkflows('open');
export const fetchClosedWorkflows = fetchWorkflows('closed');
export const fetchAllWorkflows = (
  options:
    | Parameters<typeof fetchOpenWorkflows>[0]
    | Parameters<typeof fetchClosedWorkflows>[0],
) => {
  fetchOpenWorkflows(options);
  fetchClosedWorkflows(options);
};

export async function get(
  { executionId, runId, namespace }: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<{
  execution: DescribeWorkflowExecutionResponse;
}> {
  const execution: DescribeWorkflowExecutionResponse = await request(
    `${base}/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
  )
    .then((response) => response.json())
    .catch(console.error);

  return {
    execution,
  };
}
