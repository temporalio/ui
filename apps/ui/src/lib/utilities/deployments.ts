import type { DeploymentStatus } from '$lib/types/deployments';

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
