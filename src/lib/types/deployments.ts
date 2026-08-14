import type { Timestamp } from '@temporalio/common';

type ApiTimestamp = Timestamp | string;

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
  currentVersionChangedTime?: ApiTimestamp;
  rampingVersionChangedTime?: ApiTimestamp;
  rampingVersionPercentageChangedTime?: ApiTimestamp;
  revisionNumber?: string;
}

/** A deployment returned by ListWorkerDeployments. */
export interface ListWorkerDeployment {
  name: string;
  createTime: ApiTimestamp;
  routingConfig: RoutingConfig;
  latestVersionSummary?: VersionSummaryNew;
  currentVersionSummary?: VersionSummaryNew;
  rampingVersionSummary?: VersionSummaryNew;
}

export interface ListWorkerDeploymentsResponse {
  nextPageToken: string;
  workerDeployments: ListWorkerDeployment[];
}

export function isVersionSummaryNew(
  version: VersionSummary,
): version is VersionSummaryNew & {
  deploymentVersion: WorkerDeploymentVersion;
} {
  return (
    'deploymentVersion' in version && version.deploymentVersion !== undefined
  );
}

export type VersionSummary = VersionSummaryOld | VersionSummaryNew;
export interface VersionSummaryOld {
  version: string;
  createTime: ApiTimestamp;
  drainageStatus: string;
}

export interface ProviderValidation {
  errorMessage?: string;
  lastCheckTime?: ApiTimestamp;
}

export interface ComputeStatus {
  providerValidation?: ProviderValidation;
}

export interface VersionSummaryNew {
  version: string;
  status?: string;
  drainageStatus?: string;
  deploymentVersion?: WorkerDeploymentVersion;
  createTime: ApiTimestamp;
  drainageInfo?: {
    lastChangedTime?: ApiTimestamp;
    lastCheckedTime?: ApiTimestamp;
  };
  currentSinceTime?: ApiTimestamp;
  rampingSinceTime?: ApiTimestamp;
  routingUpdateTime?: ApiTimestamp;
  firstActivationTime?: ApiTimestamp;
  lastDeactivationTime?: ApiTimestamp;
  lastCurrentTime?: ApiTimestamp;
  computeConfig?: ComputeConfig;
  computeStatus?: ComputeStatus;
}

/** A deployment returned by DescribeWorkerDeployment. */
export interface DescribeWorkerDeployment {
  name: string;
  createTime: ApiTimestamp;
  routingConfig: RoutingConfig;
  lastModifierIdentity?: string;
  versionSummaries: VersionSummary[];
  routingConfigUpdateState?: string;
}

export interface DescribeWorkerDeploymentResponse {
  conflictToken: string;
  workerDeploymentInfo: DescribeWorkerDeployment;
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
  providerType?: string;
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
  | 'Inactive'
  | 'Created';
