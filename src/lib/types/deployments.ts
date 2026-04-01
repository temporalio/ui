import type { Timestamp } from '@temporalio/common';

export interface DeploymentParameters {
  namespace: string;
  deploymentName: string;
}

export interface DeploymentVersionParameters {
  namespace: string;
  deploymentName: string;
  buildId: string;
}
export interface WorkerDeploymentVersion {
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
  return 'deploymentVersion' in version;
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
  computeConfig?: ComputeConfig;
}

export interface WorkerDeploymentInfo extends WorkerDeploymentSummary {
  lastModifierIdentity: string;
  versionSummaries: VersionSummary[];
  computeConfig?: ComputeConfig;
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
  deploymentVersion?: WorkerDeploymentVersion;
  deploymentName: string;
  createTime: Timestamp;
  routingChangedTime: Timestamp;
  currentSinceTime: Timestamp;
  rampingSinceTime: Timestamp;
  rampPercentage: number;
  taskQueueInfos: TaskQueueInfo[];
  computeConfig?: ComputeConfig;
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

export interface Payload {
  metadata?: { encoding?: string; [key: string]: string | undefined };
  data?: string;
}

export interface ComputeProvider {
  type?: string;
  details?: Payload;
  nexusEndpoint?: string;
}

export interface ComputeScaler {
  type?: string;
  details?: Payload;
}

export interface ComputeConfigScalingGroup {
  taskQueueTypes?: string[];
  provider?: ComputeProvider;
  scaler?: ComputeScaler;
}

export interface ComputeConfig {
  scalingGroups?: { [key: string]: ComputeConfigScalingGroup };
}

export interface CreateWorkerDeploymentRequest {
  namespace: string;
  deploymentName: string;
}

export interface CreateWorkerDeploymentVersionRequest {
  namespace: string;
  deploymentVersion: { deploymentName: string; buildId: string };
  computeConfig?: ComputeConfig;
  identity?: string;
  requestId?: string;
}

export interface CreateWorkerDeploymentResponse {
  conflictToken: string;
}

export const VersioningBehaviorEnum = {
  Pinned: 'Pinned',
  AutoUpgrade: 'AutoUpgrade',
};

export type DeploymentStatus =
  | 'Ramping'
  | 'Current'
  | 'Latest'
  | 'Draining'
  | 'Drained'
  | 'Inactive';
