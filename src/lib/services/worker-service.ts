import type {
  DescribeWorkerRequest,
  DescribeWorkerResponse,
  ListTaskQueuePartitionsRequest,
  ListWorkersRequest,
  ListWorkersResponse,
  WorkerInfo,
} from '$lib/types';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type PaginatedWorkerListPromise = (
  pageSize: number,
  token: string,
) => Promise<{ items: WorkerInfo[]; nextPageToken: string }>;

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
        query: parameters.query,
      },
    }).then(({ workersInfo, nextPageToken }) => {
      if (!workersInfo) {
        throw new Error('No workers info in response');
      }
      return {
        items: workersInfo,
        nextPageToken: nextPageToken ? String(nextPageToken) : '',
      };
    });
  };
};

export const fetchPaginatedWorkersForTaskQueue = async (
  parameters: ListTaskQueuePartitionsRequest,
  request = fetch,
): Promise<PaginatedWorkerListPromise> => {
  return (pageSize = 100, token = '') => {
    const route = routeForApi('workers', parameters);
    return requestFromAPI<ListWorkersResponse>(route, {
      request,
      params: {
        query: `TaskQueue="${parameters.taskQueue}"`,
        maximumPageSize: String(pageSize),
        nextPageToken: token,
      },
    }).then(({ workersInfo, nextPageToken }) => {
      if (!workersInfo) {
        throw new Error('No workers info in response');
      }
      return {
        items: workersInfo,
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
