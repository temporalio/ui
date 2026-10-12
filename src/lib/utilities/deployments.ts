import { translate } from '$lib/i18n/translate';
import {
  type DeploymentStatus,
  isVersionSummaryNew,
  type RoutingConfig,
  type VersionSummary,
} from '$lib/types/deployments';
import {
  getBuildIdFromVersion,
  getDeploymentFromVersion,
} from '$lib/utilities/get-deployment-build-id';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

export interface ParsedVersionStatus {
  status: DeploymentStatus;
  label: string;
}

const STATUS_MAP: Record<string, DeploymentStatus> = {
  WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT: 'Current',
  WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING: 'Ramping',
  WORKER_DEPLOYMENT_VERSION_STATUS_DRAINING: 'Draining',
  WORKER_DEPLOYMENT_VERSION_STATUS_DRAINED: 'Drained',
  WORKER_DEPLOYMENT_VERSION_STATUS_INACTIVE: 'Inactive',
  WORKER_DEPLOYMENT_VERSION_STATUS_CREATED: 'Created',
};

const LABEL_MAP: Record<string, string> = {
  WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT: 'Current',
  WORKER_DEPLOYMENT_VERSION_STATUS_DRAINING: 'Draining',
  WORKER_DEPLOYMENT_VERSION_STATUS_DRAINED: 'Drained',
  WORKER_DEPLOYMENT_VERSION_STATUS_INACTIVE: 'Inactive',
  WORKER_DEPLOYMENT_VERSION_STATUS_CREATED: 'Created',
};

export const parseVersionStatus = (
  apiStatus: string | undefined,
  rampingPercentage?: number,
): ParsedVersionStatus => {
  if (!apiStatus) return { status: 'Inactive', label: 'Inactive' };
  const status = STATUS_MAP[apiStatus] ?? 'Inactive';
  if (status === 'Ramping') {
    const label =
      rampingPercentage != null ? `Ramping ${rampingPercentage}%` : 'Ramping';
    return { status, label };
  }
  const label = LABEL_MAP[apiStatus] ?? 'Inactive';
  return { status, label };
};

export interface VersionRouting {
  deploymentName: string;
  buildId: string;
  isCurrent: boolean;
  isRamping: boolean;
}

/** Where a Version sits in its Deployment's routing. */
export const versionRouting = (
  version: VersionSummary,
  routingConfig: RoutingConfig | undefined,
): VersionRouting => {
  const deploymentName = isVersionSummaryNew(version)
    ? version.deploymentVersion.deploymentName
    : getDeploymentFromVersion(version.version);
  const buildId = isVersionSummaryNew(version)
    ? version.deploymentVersion.buildId
    : getBuildIdFromVersion(version.version);
  const current = routingConfig?.currentDeploymentVersion;
  const ramping = routingConfig?.rampingDeploymentVersion;
  return {
    deploymentName,
    buildId,
    isCurrent:
      deploymentName === current?.deploymentName &&
      buildId === current?.buildId,
    isRamping:
      deploymentName === ramping?.deploymentName &&
      buildId === ramping?.buildId,
  };
};

/**
 * A Version's status and its label. Routing wins: a Version the Deployment
 * routes to is Current or Ramping whatever its drainage says.
 */
export const versionStatus = (
  version: VersionSummary,
  routingConfig: RoutingConfig | undefined,
): { status: DeploymentStatus; label: string } => {
  const { isCurrent, isRamping } = versionRouting(version, routingConfig);
  if (isCurrent) {
    return {
      status: translate('deployments.current') as DeploymentStatus,
      label: translate('deployments.current'),
    };
  }
  if (isRamping) {
    return {
      status: translate('deployments.ramping') as DeploymentStatus,
      label: translate('deployments.ramping-percentage', {
        percentage: routingConfig?.rampingVersionPercentage ?? 0,
      }),
    };
  }
  if (isVersionSummaryNew(version)) return parseVersionStatus(version.status);
  if (version.drainageStatus) {
    const label = fromScreamingEnum(
      version.drainageStatus,
      'VersionDrainageStatus',
    );
    return { status: label as DeploymentStatus, label };
  }
  return {
    status: translate('common.inactive') as DeploymentStatus,
    label: translate('common.inactive'),
  };
};
