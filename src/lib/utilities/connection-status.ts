import { translate } from '$lib/i18n/translate';
import type {
  ComputeStatus,
  DescribeWorkerDeployment,
  RoutingConfig,
  VersionSummary,
} from '$lib/types/deployments';
import { isVersionSummaryNew } from '$lib/types/deployments';
import { matchesVersion } from '$lib/utilities/deployment-has-compute-config';
import { parseVersionStatus } from '$lib/utilities/deployments';
import type { ValidTime } from '$lib/utilities/format-time';
import { isTimestamp, timestampToDate } from '$lib/utilities/format-time';
import type { APIErrorResponse } from '$lib/utilities/request-from-api';

export const versionComputeProviderType = (
  summary: VersionSummary,
): string | undefined => {
  if (!isVersionSummaryNew(summary)) return undefined;
  const scalingGroup = Object.values(
    summary.computeConfig?.scalingGroups ?? {},
  )[0];
  return scalingGroup?.providerType ?? scalingGroup?.provider?.type;
};

/**
 * A connection status only exists for a version the provider currently backs,
 * so only a current, ramping, or draining version with a compute provider has
 * one to report.
 */
export const versionShowsConnectionStatus = (
  summary: VersionSummary,
  routingConfig: RoutingConfig = {},
): boolean => {
  if (!versionComputeProviderType(summary)) return false;
  return (
    matchesVersion(summary, routingConfig.currentDeploymentVersion) ||
    matchesVersion(summary, routingConfig.rampingDeploymentVersion) ||
    (isVersionSummaryNew(summary) &&
      parseVersionStatus(summary.status).status === 'Draining')
  );
};

/**
 * The Connection column is only worth a column when at least one version can
 * fill it. A self-hosted deployment has no provider to report on, so the column
 * would hold nothing but placeholders.
 */
export const deploymentShowsConnectionStatus = (
  deployment?: DescribeWorkerDeployment,
): boolean =>
  (deployment?.versionSummaries ?? []).some((summary) =>
    versionShowsConnectionStatus(summary, deployment?.routingConfig ?? {}),
  );

export type ConnectionState = 'pending' | 'connected' | 'failed';

export const deriveConnectionStatus = (
  computeStatus?: ComputeStatus,
): ConnectionState => {
  const validation = computeStatus?.providerValidation;
  if (!validation?.lastCheckTime) return 'pending';
  return validation.errorMessage ? 'failed' : 'connected';
};

export const connectionStateColor: Record<ConnectionState, string> = {
  connected: 'text-success',
  failed: 'text-danger',
  pending: 'text-subtle',
};

export const connectionStateLabel = (state: ConnectionState): string => {
  if (state === 'connected')
    return translate('deployments.connection-connected');
  if (state === 'failed') return translate('deployments.connection-failed');
  return translate('deployments.connection-pending');
};

export const formatConnectionCheckTime = (time: ValidTime): string => {
  if (!time) return translate('deployments.connection-checked-recently');
  try {
    const parsedDate = isTimestamp(time)
      ? timestampToDate(time)
      : new Date(time as string | number | Date);
    const diff = Date.now() - parsedDate.getTime();
    if (Number.isNaN(diff) || diff < 3_600_000) {
      return translate('deployments.connection-checked-recently');
    }
    const hours = Math.floor(diff / 3_600_000);
    return translate(
      hours === 1
        ? 'deployments.connection-checked-hour'
        : 'deployments.connection-checked-hours',
      { hours },
    );
  } catch {
    return translate('deployments.connection-checked-recently');
  }
};

export const connectionTooltip = (computeStatus?: ComputeStatus): string => {
  const state = deriveConnectionStatus(computeStatus);
  if (state === 'pending') {
    return translate('deployments.connection-tooltip-pending');
  }
  const checked = translate('deployments.connection-tooltip-checked', {
    time: formatConnectionCheckTime(
      computeStatus?.providerValidation?.lastCheckTime ?? '',
    ),
  });
  if (state === 'connected') return checked;
  const errorMessage = computeStatus?.providerValidation?.errorMessage ?? '';
  return (errorMessage ? `${errorMessage}. ` : '') + checked;
};

export type ValidationOutcome =
  | { state: 'valid' }
  | { state: 'invalid'; message: string }
  | { state: 'indeterminate'; message?: string };

/**
 * The backend reports a completed check that found a problem as InvalidArgument,
 * which is a verdict. Every other failure, such as a gateway timeout or a lost
 * connection, means the check did not finish, so the connection state stays
 * unknown.
 */
export const resolveValidationOutcome = (
  error: Pick<APIErrorResponse, 'status' | 'body'>,
): ValidationOutcome => {
  const message = error?.body?.message || undefined;
  if (error?.status === 400) {
    return {
      state: 'invalid',
      message: message ?? translate('deployments.validate-connection-error'),
    };
  }
  return { state: 'indeterminate', message };
};
