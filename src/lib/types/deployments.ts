import type { Timestamp } from '@temporalio/common';

export interface DeploymentParameters {
  namespace: string;
  deploymentName: string;
}

export interface DeploymentVersionParameters {
  namespace: string;
  version: string;
}

export interface RoutingConfig {
  currentVersion: string;
  rampingVersion: string;
  rampingVersionPercentage: number;
  currentVersionChangedTime: Timestamp;
  rampingVersionChangedTime: Timestamp;
  rampingVersionPercentageChangedTime: Timestamp;
}

export interface WorkerDeploymentSummary {
  name: string;
  createTime: Timestamp;
  routingConfig: RoutingConfig;
}

export interface ListWorkerDeploymentsResponse {
  nextPageToken: string;
  workerDeployments: WorkerDeploymentSummary[];
}

export interface VersionSummary {
  version: string;
  createTime: Timestamp;
  drainageStatus: string;
}
export interface WorkerDeploymentInfo extends WorkerDeploymentSummary {
  lastModifierIdentity: string;
  versionSummaries: VersionSummary[];
}

export interface WorkerDeploymentResponse {
  conflictToken: string;
  workerDeploymentInfo: WorkerDeploymentInfo;
}

export interface TaskQueueInfo {
  name: string;
  type: string;
}

export interface WorkerDeploymentVersionInfo {
  version: string;
  deploymentName: string;
  createTime: Timestamp;
  routingChangedTime: Timestamp;
  currentSinceTime: Timestamp;
  rampingSinceTime: Timestamp;
  rampPercentage: number;
  taskQueueInfos: TaskQueueInfo[];
  drainageInfo: {
    status: string;
    lastChangedTime: Timestamp;
    lastCheckedTime: Timestamp;
  };
  metadata: {
    entries: Record<string, string>;
  };
}

export interface WorkerDeploymentVersionResponse {
  workerDeploymentVersionInfo: WorkerDeploymentVersionInfo;
}
