import type { Timestamp } from '@temporalio/common';

import type { WorkerDeploymentVersion } from '$lib/types/deployments';
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
  status: string;
  startTime: Timestamp;
  heartbeatTime: Timestamp;
  elapsedSinceLastHeartbeat: Timestamp;
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
  const response = await requestFromAPI<ListWorkersResponse>(route, {
    request,
    params: { taskQueue: parameters.queue },
  });
  return response;
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
