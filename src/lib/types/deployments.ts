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
  /** A `WorkerDeploymentVersionStatus` enum name. */
  status?: string;
  deploymentVersion?: WorkerDeploymentVersion;
  deploymentName: string;
  createTime: ApiTimestamp;
  routingChangedTime?: ApiTimestamp;
  currentSinceTime?: ApiTimestamp;
  rampingSinceTime?: ApiTimestamp;
  firstActivationTime?: ApiTimestamp;
  lastCurrentTime?: ApiTimestamp;
  lastDeactivationTime?: ApiTimestamp;
  rampPercentage?: number;
  taskQueueInfos?: TaskQueueInfo[];
  computeConfig?: ComputeConfig;
  drainageInfo?: {
    status?: string;
    lastChangedTime?: ApiTimestamp;
    lastCheckedTime?: ApiTimestamp;
  };
  metadata?: {
    /** User-defined values. The API sends each as a Payload. */
    entries?: Record<string, Payload>;
  };
  lastModifierIdentity?: string;
}

export interface TaskQueueStats {
  approximateBacklogCount?: string | number;
  /** A proto Duration as JSON, e.g. "130.5s". */
  approximateBacklogAge?: string;
  tasksAddRate?: number;
  tasksDispatchRate?: number;
}

export interface VersionTaskQueue {
  name: string;
  /** A `TaskQueueType` enum name. */
  type: string;
  stats?: TaskQueueStats;
}

export interface WorkerDeploymentVersionResponse {
  workerDeploymentVersionInfo: WorkerDeploymentVersionInfo;
  /** Present when the request sets `reportTaskQueueStats`. */
  versionTaskQueues?: VersionTaskQueue[];
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
  /**
   * The Namespace regions that activate this group. Empty or absent means the
   * group runs wherever the Namespace is active, which is every group written
   * before this field existed.
   *
   * Repeated, so one group can serve several regions: that is the shape for a
   * provider whose resource is not regional. A regional resource, such as a
   * Lambda ARN, needs a group per region instead.
   *
   * `region_ids` on `ComputeConfigScalingGroup`, added by temporalio/api#875.
   */
  regionIds?: string[];
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
