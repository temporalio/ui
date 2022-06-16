import { formatDate, formatDuration } from '$lib/utilities/format-date';
import type { PendingActivityInfo } from '$types';

const keysToBeFormattedAsTime = [
  'closeTime',
  'createTime',
  'currentAttemptScheduledTime',
  'earliestTime',
  'eventTime',
  'executionTime',
  'expirationTime',
  'expireTime',
  'lastAccessTime',
  'lastHeartbeatTime',
  'lastStartedTime',
  'lastUpdateTime',
  'latestTime',
  'releaseTime',
  'scheduledTime',
  'startedTime',
  'startTime',
  'workflowExecutionExpirationTime',
] as const;

const keysToBeFormattedAsDuration = [
  'backoffStartInterval',
  'defaultWorkflowTaskTimeout',
  'firstWorkflowTaskBackoff',
  'heartbeatTimeout',
  'initialInterval',
  'maximumInterval',
  'scheduleToCloseTimeout',
  'scheduleToStartTimeout',
  'startToCloseTimeout',
  'startToFireTimeout',
  'workflowExecutionRetentionPeriod',
  'workflowExecutionRetentionTtl',
  'workflowExecutionTimeout',
  'workflowRunTimeout',
  'workflowTaskTimeout',
] as const;

const isTime = (key: string): key is typeof keysToBeFormattedAsTime[number] => {
  for (const timeKey of keysToBeFormattedAsTime) {
    if (timeKey === key) return true;
  }
  return false;
};

const isDuration = (
  key: string,
): key is typeof keysToBeFormattedAsDuration[number] => {
  for (const timeKey of keysToBeFormattedAsDuration) {
    if (timeKey === key) return true;
  }
  return false;
};

const canBeSimplified = (value: unknown): value is Record<string, string> => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (typeof value !== 'object') return false;

  const keys = Object.keys(value);
  const [key] = keys;

  if (keys.length !== 1) return false;
  if (typeof value[key] !== 'string') return false;

  return true;
};

const getValueForFirstKey = (value: Record<string, string>): string => {
  for (const v of Object.values(value)) {
    return v;
  }
};

export function simplifyAttributes(
  attributes: EventAttributesWithType,
  preserveTimestamps?: boolean,
): EventAttributesWithType;
export function simplifyAttributes(
  attributes: PendingActivityInfo,
  preserveTimestamps?: boolean
): PendingActivityInfo;
export function simplifyAttributes<
  T = EventAttributesWithType | PendingActivityInfo,
>(attributes: T, preserveTimestamps: boolean = false): T {
  for (const [key, value] of Object.entries(attributes)) {
    if (canBeSimplified(value)) {
      attributes[key] = getValueForFirstKey(value);
    }

    if (isTime(key) && !preserveTimestamps) {
      attributes[key] = formatDate(value);
    }

    if (isDuration(key)) {
      attributes[key] = formatDuration(value);
    }
  }

  return attributes;
}
