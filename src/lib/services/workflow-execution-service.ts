import { sub, formatISO } from 'date-fns';
import isFunction from 'lodash/isFunction';

import type {
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';

const id = <T>(x: T) => x;
const noop = () => {};
const createDate = (d: Duration) => formatISO(sub(new Date(), d));

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

type FetchWorkflows<T> = NamespaceScopedRequest &
  PaginationCallbacks<T> & {
    startTime?: Duration;
    request?: typeof fetch;
  };

type FetchEvents = FetchWorkflows<GetWorkflowExecutionHistoryResponse> & {
  executionId: string;
  runId: string;
};

/**
 * Utility function to fetch either opened or closed workflows from the
 * Temporal server. Unless you have a good reason, you should prefer to
 * use `fetchAllWorkflows`. This function is intentionally _not_ exported.
 */
const fetchWorkflows =
  (type: 'open' | 'closed') =>
  async (
    {
      namespace,
      onStart = noop,
      onUpdate = id,
      onComplete = id,
      startTime = { days: 1 },
    }: FetchWorkflows<ListWorkflowExecutionsResponse>,
    request = fetch,
  ): Promise<ListWorkflowExecutionsResponse> => {
    return await paginated(
      async (token: string) => {
        return requestFromAPI<ListWorkflowExecutionsResponse>(
          `/namespaces/${namespace}/workflows/${type}`,
          {
            params: {
              'start_time_filter.earliest_time': createDate(startTime),
            },
            token,
            request,
          },
        );
      },
      { onStart, onUpdate, onComplete },
    );
  };

/**
 * Fetches both open and closed workflows. Forwards all options to
 * `fetchWorkflows` except for `onComplete` which is called when
 * both open and closed requests have completed.
 */
export const fetchAllWorkflows = async (
  options: FetchWorkflows<ListWorkflowExecutionsResponse>,
) => {
  const { onComplete } = options;

  const result: WithoutNextPageToken<ListWorkflowExecutionsResponse> = {
    executions: [],
  };

  const callback = (
    response: WithoutNextPageToken<ListWorkflowExecutionsResponse>,
  ) => {
    result.executions.push(...response.executions);
    if (openIsComplete && closedIsComplete && isFunction(onComplete)) {
      onComplete(result);
    }
  };

  let openIsComplete = false;
  let closedIsComplete = false;

  const open = await fetchWorkflows('open')({
    ...options,
    onComplete: (response) => {
      openIsComplete = true;
      callback(response);
    },
  });

  const closed = await fetchWorkflows('closed')({
    ...options,
    onComplete: (response) => {
      closedIsComplete = true;
      callback(response);
    },
  });

  return { ...open.executions, ...closed.executions };
};

export async function fetchWorkflow(
  { executionId, runId, namespace }: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<DescribeWorkflowExecutionResponse> {
  return requestFromAPI(
    `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
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
          token,
          request,
        },
      );
    },
    { onUpdate },
  );

  return events;
};
