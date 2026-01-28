import type { CountWorkflowExecutionsResponse } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchActivityCount = async (
  namespace: string,
  query: string,
  request = fetch,
): Promise<{ count: number }> => {
  let count = 0;
  try {
    const countRoute = routeForApi('standalone-activities.count', {
      namespace,
    });
    const result = await requestFromAPI<{ count: string }>(countRoute, {
      params: query ? { query } : {},
      onError: () => {},
      handleError: () => {},
      request,
    });
    count = parseInt(result?.count || '0');
  } catch (e) {
    // Don't fail the activities call due to count
  }

  return { count };
};

type ActivityCountByStatusOptions = {
  namespace: string;
  query: string;
};

export const fetchActivityCountByStatus = async ({
  namespace,
  query,
}: ActivityCountByStatusOptions): Promise<CountWorkflowExecutionsResponse> => {
  const groupByClause = 'GROUP BY ExecutionStatus';
  const countRoute = routeForApi('standalone-activities.count', {
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
