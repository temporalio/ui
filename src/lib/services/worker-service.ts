import { type WorkerStatus, workerStatuses } from '$lib/models/worker-status';
import type {
  DescribeWorkerRequest,
  DescribeWorkerResponse,
  ListWorkersRequest,
  ListWorkersResponse,
  WorkerHeartbeat,
  WorkerListInfo,
} from '$lib/types';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type WorkerStatusCount = {
  status: WorkerStatus;
  count: number | undefined;
};

type PaginatedWorkerListPromise = (
  pageSize: number,
  token: string,
) => Promise<{
  items: WorkerHeartbeat[] | WorkerListInfo[];
  nextPageToken: string;
}>;

export const fetchPaginatedWorkers = async (
  parameters: ListWorkersRequest,
  request = fetch,
): Promise<PaginatedWorkerListPromise> => {
  return (pageSize = 100, token = '') => {
    const route = routeForApi('workers', {
      namespace: parameters.namespace ?? '',
    });
    return requestFromAPI<ListWorkersResponse>(route, {
      request,
      params: {
        pageSize: String(pageSize),
        nextPageToken: token,
        ...(parameters.query && { query: parameters.query }),
      },
    }).then((response) => {
      const { workersInfo, workers, nextPageToken } = response ?? {};
      return {
        items:
          workers ??
          workersInfo
            ?.map(({ workerHeartbeat }) => workerHeartbeat)
            .filter((h): h is WorkerHeartbeat => !!h) ??
          [],
        nextPageToken: nextPageToken ? String(nextPageToken) : '',
      };
    });
  };
};

export const fetchWorkerCount = async (
  { namespace, query }: ListWorkersRequest,
  request = fetch,
): Promise<{ count: number | undefined }> => {
  try {
    const route = routeForApi('workers.count', {
      namespace: namespace ?? '',
    });
    const result = await requestFromAPI<{ count: string }>(route, {
      params: query ? { query } : {},
      handleError: () => {},
      request,
    });
    if (result?.count === undefined) return { count: undefined };

    const count = parseInt(result.count);
    return { count: Number.isNaN(count) ? undefined : count };
  } catch {
    return { count: undefined };
  }
};

export const toWorkerStatusQuery = (
  status: WorkerStatus,
  query = '',
): string => {
  const statusQuery = `\`WorkerStatus\`="${status}"`;
  return query ? `(${query}) AND ${statusQuery}` : statusQuery;
};

export const fetchWorkerCountByStatus = async (
  { namespace, query }: ListWorkersRequest,
  request = fetch,
): Promise<WorkerStatusCount[]> =>
  Promise.all(
    workerStatuses.map(async (status) => {
      const { count } = await fetchWorkerCount(
        { namespace, query: toWorkerStatusQuery(status, query ?? '') },
        request,
      );
      return { status, count };
    }),
  );

export const sumWorkerStatusCounts = (
  counts: WorkerStatusCount[],
): number | undefined => {
  const counted = counts.flatMap(({ count }) => count ?? []);
  return counted.length
    ? counted.reduce((total, count) => total + count, 0)
    : undefined;
};

export async function describeWorker(
  parameters: DescribeWorkerRequest,
  request = fetch,
): Promise<DescribeWorkerResponse> {
  const route = routeForApi('worker', {
    namespace: parameters.namespace ?? '',
    workerInstanceKey: parameters.workerInstanceKey ?? '',
  });
  return (
    (await requestFromAPI<DescribeWorkerResponse>(route, {
      request,
    })) ?? {}
  );
}
