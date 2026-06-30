import { formatDistanceToNowStrict } from 'date-fns';

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
