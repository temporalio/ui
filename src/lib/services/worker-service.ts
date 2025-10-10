import type { NamespaceScopedRequest } from '$lib/types/global';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type ListWorkersRequest = NamespaceScopedRequest & {
  queue: string;
};

export type DescribeWorkerRequest = NamespaceScopedRequest & {
  queue: string;
  identity: string;
};

export type WorkerInfo = {
  identity: string;
  buildId: string;
  lastAccessTime: string;
  taskQueueTypes: number[];
  rateLimitPerSecond: number;
};

export type ListWorkersResponse = {
  workers: WorkerInfo[];
};

export type DescribeWorkerResponse = {
  buildId: string;
  capabilities: {
    useVersioning: boolean;
    activityOnly: boolean;
  };
  lastAccessTime: string;
  rateLimitPerSecond: number;
  taskQueues: {
    name: string;
    kind: number;
  }[];
};

export async function listWorkers(
  parameters: ListWorkersRequest,
  request = fetch,
): Promise<ListWorkersResponse> {
  const route = routeForApi('workers', parameters);
  return await requestFromAPI<ListWorkersResponse>(route, {
    request,
    params: { taskQueue: parameters.queue },
  });
}

export async function describeWorker(
  parameters: DescribeWorkerRequest,
  request = fetch,
): Promise<DescribeWorkerResponse> {
  const route = routeForApi('worker', parameters);
  return await requestFromAPI<DescribeWorkerResponse>(route, {
    request,
    params: { identity: parameters.identity },
  });
}
