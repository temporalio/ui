import { get } from 'svelte/store';

import { TASK_FAILURES_QUERY } from '$lib/stores/saved-queries';
import { workflowCount } from '$lib/stores/workflows';
import type { CountWorkflowExecutionsResponse } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchWorkflowCount = async (
  namespace: string,
  query: string,
  request = fetch,
): Promise<{ count: number }> => {
  let count = 0;
  try {
    const countRoute = routeForApi('workflows.count', { namespace });
    const result = await requestFromAPI<{ count: string }>(countRoute, {
      params: query ? { query } : {},
      onError: () => {},
      handleError: () => {},
      request,
    });
    count = parseInt(result?.count || '0');
  } catch (e) {
    // Don't fail the workflows call due to count
  }

  return { count };
};

export const fetchWorkflowTaskFailures = async (
  namespace: string,
  request = fetch,
): Promise<void> => {
  try {
    const countRoute = routeForApi('workflows.count', { namespace });
    const result = await requestFromAPI<{ count: string }>(countRoute, {
      params: { query: TASK_FAILURES_QUERY },
      onError: () => {},
      handleError: () => {},
      request,
    });
    get(workflowCount).taskFailureCount = parseInt(result?.count || '0');
  } catch (e) {
    // Don't fail the workflows call due to count
  }
};

type WorkflowCountByExecutionStatusOptions = {
  namespace: string;
  query: string;
};

export const fetchWorkflowCountByExecutionStatus = async ({
  namespace,
  query,
}: WorkflowCountByExecutionStatusOptions): Promise<CountWorkflowExecutionsResponse> => {
  const groupByClause = 'GROUP BY ExecutionStatus';
  const countRoute = routeForApi('workflows.count', {
    namespace,
  });
  const { count, groups } =
    await requestFromAPI<CountWorkflowExecutionsResponse>(countRoute, {
      params: {
        query: query ? `${query} ${groupByClause}` : `${groupByClause}`,
      },
      notifyOnError: false,
    });
  return { count: count ?? '0', groups };
};

export const fetchScheduleCount = async ({
  namespace,
  query,
}: {
  namespace: string;
  query?: string;
}): Promise<string> => {
  const scheduleFixedQuery =
    'TemporalNamespaceDivision="TemporalScheduler" AND ExecutionStatus="Running"';

  const fullQuery = query
    ? `${scheduleFixedQuery} AND ${query}`
    : scheduleFixedQuery;
  const countRoute = routeForApi('workflows.count', {
    namespace,
  });
  const { count } = await requestFromAPI<CountWorkflowExecutionsResponse>(
    countRoute,
    {
      params: {
        query: fullQuery,
      },
      notifyOnError: false,
    },
  );
  return count ?? '0';
};
