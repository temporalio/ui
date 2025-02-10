import type { Timestamp } from '@temporalio/common';

export interface DeploymentParameters {
  namespace: string;
  deploymentName: string;
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
