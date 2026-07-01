import { formatDistanceToNowStrict } from 'date-fns';

import { translate } from '$lib/i18n/translate';
import type { ComputeStatus } from '$lib/types/deployments';
import type { ValidTime } from '$lib/utilities/format-time';
import { isTimestamp, timestampToDate } from '$lib/utilities/format-time';

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
  if (!time) return 'less than an hour ago';
  try {
    const parsedDate = isTimestamp(time)
      ? timestampToDate(time)
      : new Date(time as string | number | Date);
    const diff = Date.now() - parsedDate.getTime();
    if (diff < 0 || diff < 3_600_000) return 'less than an hour ago';
    return formatDistanceToNowStrict(parsedDate, {
      unit: 'hour',
      addSuffix: true,
    });
  } catch {
    return 'less than an hour ago';
  }
};

export const connectionTooltip = (computeStatus?: ComputeStatus): string => {
  const state = deriveConnectionStatus(computeStatus);
  if (state === 'pending') {
    return translate('deployments.connection-tooltip-pending');
  }
  const time = formatConnectionCheckTime(
    computeStatus?.providerValidation?.lastCheckTime,
  );
  if (state === 'connected') {
    return translate('deployments.connection-tooltip-connected', { time });
  }
  const errorMessage = computeStatus?.providerValidation?.errorMessage ?? '';
  return (
    (errorMessage ? `${errorMessage}. ` : '') +
    translate('deployments.connection-tooltip-failed-checked', { time })
  );
};
