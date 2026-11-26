import type { PendingActivityInfo, PendingNexusInfo } from '$lib/types';
import type {
  EventAttributeKey,
  EventAttributesWithType,
  PendingActivity,
  PendingNexusOperation,
} from '$lib/types/events';
import { formatDate } from '$lib/utilities/format-date';
import { formatDuration, type ValidTime } from '$lib/utilities/format-time';
import { has } from '$lib/utilities/has';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

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

const isTime = (
  key: string,
): key is (typeof keysToBeFormattedAsTime)[number] => {
  for (const timeKey of keysToBeFormattedAsTime) {
    if (timeKey === key) return true;
  }
  return false;
};

const isDuration = (
  key: string,
): key is (typeof keysToBeFormattedAsDuration)[number] => {
  for (const timeKey of keysToBeFormattedAsDuration) {
    if (timeKey === key) return true;
  }
  return false;
};

export const canBeSimplified = (
  value: unknown,
): value is Record<string, string> => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (typeof value !== 'object') return false;

  const keys = Object.keys(value);
  const [key] = keys;

  if (keys.length !== 1) return false;
  if (typeof (value as Record<string, unknown>)[key] !== 'string') return false;

  return true;
};

export const getValueForFirstKey = (
  value: Record<string, string>,
): string | undefined => {
  for (const entry of Object.values(value)) {
    return entry;
  }
  return undefined;
};

export function simplifyAttributes(
  attributes: EventAttributesWithType<EventAttributeKey>,
  preserveTimestamps?: boolean,
): EventAttributesWithType<EventAttributeKey>;
export function simplifyAttributes(
  attributes: PendingActivityInfo,
  preserveTimestamps?: boolean,
): PendingActivity;
export function simplifyAttributes(
  attributes: PendingNexusInfo,
  preserveTimestamps?: boolean,
): PendingNexusOperation;
export function simplifyAttributes<
  T = EventAttributesWithType<EventAttributeKey> | PendingActivityInfo,
>(attributes: T, preserveTimestamps = false): T {
  const indexableAttributes = attributes as Record<string, unknown>;
  for (const [key, value] of Object.entries(indexableAttributes)) {
    if (canBeSimplified(value)) {
      indexableAttributes[key] = getValueForFirstKey(value);
    }

    if (isTime(key) && !preserveTimestamps) {
      indexableAttributes[key] = formatDate(value as ValidTime);
    }

    if (isDuration(key)) {
      indexableAttributes[key] = formatDuration(
        value as string | Parameters<typeof formatDuration>[0],
      );
    }

    if (key === 'versioningBehavior') {
      indexableAttributes[key] = fromScreamingEnum(value, 'VersioningBehavior');
    }
  }

  if (
    has(attributes, 'workerVersion') &&
    has(attributes, 'deploymentVersion')
  ) {
    delete attributes.workerVersion;
  }

  return attributes;
}
