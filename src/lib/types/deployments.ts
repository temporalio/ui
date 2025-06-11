import type { Timestamp } from '@temporalio/common';

export interface DeploymentParameters {
  namespace: string;
  deploymentName: string;
}

export interface DeploymentVersionParameters {
  namespace: string;
  version: string;
}

interface WorkerDeploymentVersion {
  buildId: string;
  deploymentName: string;
}
export interface RoutingConfig {
  currentVersion?: string;
  currentDeploymentVersion?: WorkerDeploymentVersion;
  rampingVersion?: string;
  rampingDeploymentVersion?: WorkerDeploymentVersion;
  rampingVersionPercentage?: number;
  currentVersionChangedTime?: Timestamp;
  rampingVersionChangedTime?: Timestamp;
  rampingVersionPercentageChangedTime?: Timestamp;
}

export interface WorkerDeploymentSummary {
  name: string;
  createTime: Timestamp;
  routingConfig: RoutingConfig;
  latestVersionSummary?: VersionSummaryNew;
  currentVersionSummary: VersionSummaryNew;
  rampingVersionSummary?: VersionSummaryNew;
}

export interface ListWorkerDeploymentsResponse {
  nextPageToken: string;
  workerDeployments: WorkerDeploymentSummary[];
}

export function isVersionSummaryNew(
  version: VersionSummary,
): version is VersionSummaryNew {
  return 'status' in version;
}

export type VersionSummary = VersionSummaryOld | VersionSummaryNew;
export interface VersionSummaryOld {
  version: string;
  createTime: Timestamp;
  drainageStatus: string;
}

export interface VersionSummaryNew {
  version: string;
  status?: string;
  drainageStatus?: string;
  deploymentVersion?: WorkerDeploymentVersion;
  createTime: Timestamp;
  drainageInfo?: {
    lastChangedTime?: Timestamp;
    lastCheckedTime?: Timestamp;
  };
  currentSinceTime?: Timestamp;
  rampingSinceTime?: Timestamp;
  routingUpdateTime?: Timestamp;
  firstActivationTime?: Timestamp;
  lastDeactivationTime?: Timestamp;
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

export interface VersioningInfo {
  behavior: string;
  version: string;
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

export type DeploymentStatus =
  | 'Ramping'
  | 'Current'
  | 'Latest'
  | 'Draining'
  | 'Drained'
  | 'Inactive';
