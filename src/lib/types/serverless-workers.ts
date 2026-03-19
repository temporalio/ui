import type { WorkerInfo } from '$lib/types';
import type { DeploymentStatus } from '$lib/types/deployments';

export type ServerlessWorkerStatus = 'running' | 'stopped' | 'draining';

export type ComputeProvider = 'Lambda' | 'Cloud Run' | 'Self-Managed';

export interface ServerlessWorker {
  id: string;
  name: string;
  status: ServerlessWorkerStatus;
  compute: ComputeProvider;
  lambdaArn: string;
  iamRoleArn: string;
  region: string;
  taskQueue: string;
  maxWorkers: number;
  maxConcurrentActivities: number;
  maxTaskQueueActivitiesPerSecond: number;
  idleTimeoutSeconds: number;
  lastHeartbeat: string;
  sdkVersion: string;
  createdAt: string;
  updatedAt: string;
}

export type ServerlessWorkerCreateInput = Omit<
  ServerlessWorker,
  'id' | 'status' | 'lastHeartbeat' | 'createdAt' | 'updatedAt'
>;

export type ServerlessWorkerUpdateInput = Pick<
  ServerlessWorker,
  | 'name'
  | 'lambdaArn'
  | 'iamRoleArn'
  | 'region'
  | 'taskQueue'
  | 'maxWorkers'
  | 'maxConcurrentActivities'
  | 'maxTaskQueueActivitiesPerSecond'
  | 'idleTimeoutSeconds'
>;

export interface ServerlessWorkerMetricsCard {
  slotType: string;
  slotsUsed: number;
  slotsAvailable: number;
  tasksProcessed: number;
  pollerCount: number;
  pollerStrategy: string;
  lastPoll: string;
}

export interface ServerlessWorkerMetrics {
  workflow: ServerlessWorkerMetricsCard;
  activity: ServerlessWorkerMetricsCard;
  nexus: ServerlessWorkerMetricsCard;
  localActivities: ServerlessWorkerMetricsCard;
}

export interface ServerlessWorkerHostInfo {
  region: string;
  hostName: string;
  processId: string;
  instanceKey: string;
  workerGroupingKey: string;
  cpuUsage: number;
  memoryUsage: number;
}

export interface ServerlessWorkerCache {
  cacheSize: number;
  cacheHitsPercent: number;
  activeThreadCount: number;
}

export interface ServerlessWorkerDiagnostics {
  pollSuccessRatePercent: number;
  rateLimit: number;
}

export interface ServerlessWorkerVersion {
  status: DeploymentStatus;
  name: string;
  buildId: string;
  deployedAt: string;
  rampingPercentage?: number;
}

export type ServerlessWorkerDetail = ServerlessWorker & {
  metrics: ServerlessWorkerMetrics;
  hostInfo: ServerlessWorkerHostInfo;
  cache: ServerlessWorkerCache;
  diagnostics: ServerlessWorkerDiagnostics;
  versions: ServerlessWorkerVersion[];
};

export interface MockValidationResult {
  valid: boolean;
  message: string;
}

export type UnifiedWorkerRow =
  | { type: 'traditional'; data: WorkerInfo }
  | { type: 'serverless'; data: ServerlessWorker };
