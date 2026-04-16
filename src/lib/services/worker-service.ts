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
    const route = routeForApi('workers', parameters);
    return requestFromAPI<ListWorkersResponse>(route, {
      request,
      params: {
        maximumPageSize: String(pageSize),
        nextPageToken: token,
        ...(parameters.query && { query: parameters.query }),
      },
    }).then(({ workersInfo, workers, nextPageToken }) => {
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

export async function describeWorker(
  parameters: DescribeWorkerRequest,
  request = fetch,
): Promise<DescribeWorkerResponse> {
  const route = routeForApi('worker', parameters);
  return await requestFromAPI<DescribeWorkerResponse>(route, {
    request,
  });
}
