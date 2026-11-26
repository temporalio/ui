import type { CountWorkflowExecutionsResponse } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchNexusOperationCount = async (
  namespace: string,
  query: string,
  request = fetch,
): Promise<{ count: number }> => {
  let count = 0;
  try {
    const countRoute = routeForApi('standalone-nexus-operations.count', {
      namespace,
    });
    const result = await requestFromAPI<{ count: string }>(countRoute, {
      params: query ? { query } : {},
      onError: () => {},
      handleError: () => {},
      request,
    });
    count = parseInt(result?.count || '0');
  } catch {
    // Don't fail the nexus operations call due to count
  }

  return { count };
};

type NexusOperationCountByStatusOptions = {
  namespace: string;
  query: string;
};

export const fetchNexusOperationCountByStatus = async ({
  namespace,
  query,
}: NexusOperationCountByStatusOptions): Promise<
  Required<CountWorkflowExecutionsResponse>
> => {
  const groupByClause = 'GROUP BY ExecutionStatus';
  const countRoute = routeForApi('standalone-nexus-operations.count', {
    namespace,
  });
  const { count, groups } =
    (await requestFromAPI<CountWorkflowExecutionsResponse>(countRoute, {
      params: {
        query: query ? `${query} ${groupByClause}` : `${groupByClause}`,
      },
      notifyOnError: false,
    })) ?? {};
  return { count: count ?? '0', groups: groups ?? [] };
};
