import { noop } from 'svelte/internal';

import type { WorkflowFilter } from '$lib/models/workflow-filters';
import type { CountWorkflowExecutionsResponse } from '$lib/types/workflows';
import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchWorkflowCount = async (
  namespace: string,
  query: string,
  request = fetch,
): Promise<{ totalCount: number; count: number }> => {
  let totalCount = 0;
  let count = 0;
  try {
    const countRoute = routeForApi('workflows.count', { namespace });
    if (!query) {
      const totalCountResult = await requestFromAPI<{ count: string }>(
        countRoute,
        {
          params: {},
          onError: noop,
          handleError: noop,
          request,
        },
      );
      totalCount = parseInt(totalCountResult?.count);
    } else {
      const countPromise = requestFromAPI<{ count: string }>(countRoute, {
        params: { query },
        onError: noop,
        handleError: noop,
        request,
      });
      const totalCountPromise = requestFromAPI<{ count: string }>(countRoute, {
        params: { query: '' },
        onError: noop,
        handleError: noop,
        request,
      });
      const [countResult, totalCountResult] = await Promise.all([
        countPromise,
        totalCountPromise,
      ]);
      count = parseInt(countResult?.count ?? '0');
      totalCount = parseInt(totalCountResult?.count);
    }
  } catch (e) {
    // Don't fail the workflows call due to count
  }

  return { count, totalCount };
};

type WorkflowCountByExecutionStatusOptions = {
  namespace: string;
  filters: WorkflowFilter[];
};

export const fetchWorkflowCountByExecutionStatus = async ({
  namespace,
  filters,
}: WorkflowCountByExecutionStatusOptions): Promise<CountWorkflowExecutionsResponse> => {
  try {
    const groupByClause = 'GROUP BY ExecutionStatus';
    const countRoute = routeForApi('workflows.count', {
      namespace,
    });
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    const { count, groups } =
      await requestFromAPI<CountWorkflowExecutionsResponse>(countRoute, {
        params: { query: `${query} ${groupByClause}` },
        notifyOnError: false,
      });
    return { count, groups };
  } catch (e) {
    return { count: '0', groups: [] };
  }
};
