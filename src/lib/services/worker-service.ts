import type { Duration, Timestamp } from '@temporalio/common';

import type { WorkerStatus } from '$lib/types';
import type { WorkerDeploymentVersion } from '$lib/types/deployments';
import type { NamespaceScopedRequest } from '$lib/types/global';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type WorkerQueryParams = {
  workerInstanceKey?: string;
  workerIdentity?: string;
  hostName?: string;
  taskQueue?: string;
  deploymentName?: string;
  buildId?: string;
  sdkName?: string;
  sdkVersion?: string;
  startTime?: Timestamp;
  lastHeartbeatTime?: Timestamp;
  status?: WorkerStatus;
};

export type ListWorkersRequest = NamespaceScopedRequest & {
  query?: string;
};

export type ListTaskQueueWorkersRequest = NamespaceScopedRequest & {
  taskQueue: string;
};

export type DescribeWorkerRequest = NamespaceScopedRequest & {
  workerInstanceKey: string;
};

export type HostInfo = {
  hostName: string;
  workerGroupingKey: string;
  processId: string;
  currentHostCpuUsage: number;
  currentHostMemUsage: number;
};

export type WorkerSlotsInfo = {
  currentAvailableSlots?: number;
  currentUsedSlots?: number;
  slotSupplierKind?: string;
  totalProcessedTasks?: number;
  totalFailedTasks?: number;
  lastIntervalProcessedTasks?: number;
  lastIntervalFailedTasks?: number;
};

export type WorkerPollerInfo = {
  currentPollers: number;
  lastSuccessfulPollTime: Timestamp;
  isAutoscaling: boolean;
};

export type PluginInfo = {
  name: string;
  version: string;
};

export type WorkerHeartbeat = {
  workerInstanceKey: string;
  workerIdentity: string;
  hostInfo: HostInfo;
  taskQueue: string;
  deploymentVersion: WorkerDeploymentVersion;
  sdkName: string;
  sdkVersion: string;
  status: WorkerStatus;
  startTime: Timestamp;
  heartbeatTime: Timestamp;
  elapsedSinceLastHeartbeat: Duration;
  workflowTaskSlotsInfo: WorkerSlotsInfo;
  activityTaskSlotsInfo: WorkerSlotsInfo;
  nexusTaskSlotsInfo: WorkerSlotsInfo;
  localActivitySlotsInfo: WorkerSlotsInfo;
  workflowPollerInfo: WorkerPollerInfo;
  workflowStickyPollerInfo: WorkerPollerInfo;
  activityPollerInfo: WorkerPollerInfo;
  nexusPollerInfo: WorkerPollerInfo;
  totalStickyCacheHit: number;
  totalStickyCacheMiss: number;
  currentStickyCacheSize: number;
  plugins: PluginInfo[];
};

export type WorkerInfo = {
  workerHeartbeat: WorkerHeartbeat;
};

export type ListWorkersResponse = {
  workersInfo: WorkerInfo[];
  nextPageToken?: string;
};

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
  parameters: ListTaskQueueWorkersRequest,
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

export type DescribeWorkerResponse = { workerInfo: WorkerInfo };

export async function describeWorker(
  parameters: DescribeWorkerRequest,
  request = fetch,
): Promise<DescribeWorkerResponse> {
  const route = routeForApi('worker', parameters);
  return await requestFromAPI<DescribeWorkerResponse>(route, {
    request,
  });
}
