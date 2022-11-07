import { isEventGroup } from '$lib/models/event-groups';
import { capitalize } from '$lib/utilities/format-camel-case';
import type { CombinedAttributes } from './format-event-attributes';
import { isLocalActivityMarkerEvent } from './is-event-type';

type SummaryAttribute = {
  key: string;
  value: string | Record<string, unknown>;
};

const emptyAttribute: SummaryAttribute = { key: '', value: '' };

const keysForPlainText: Readonly<Set<string>> = new Set([
  'activityId',
  'attempt',
  'binaryChecksum',
  'identity',
  'parentInitiatedEventId',
  'requestId',
  'scheduledEventId',
  'startedEventId',
  'lastHeartbeatTime',
  'scheduledTime',
  'expirationTime',
]);

export const shouldDisplayAsPlainText = (key: string): boolean => {
  return keysForPlainText.has(key);
};

export const shouldDisplayAttribute = (
  key: string,
  value: unknown,
): boolean => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (value === '0s') return false;
  if (key === 'type') return false;
  return true;
};

export const shouldDisplayNestedAttribute = (value: unknown): boolean => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (Array.isArray(value) && !value.length) return false;

  return true;
};

export const getCodeBlockValue: Parameters<typeof JSON.stringify>[0] = (
  value: string | Record<string, unknown>,
) => {
  if (typeof value === 'string') return value;
  return value?.payloads ?? value?.indexedFields ?? value?.points ?? value;
};

const keysWithExecutionLinks = [
  'baseRunId',
  'continuedExecutionRunId',
  'firstExecutionRunId',
  'newExecutionRunId',
  'newRunId',
  'originalExecutionRunId',
] as const;

// For linking to same workflow but different execution
export const shouldDisplayAsExecutionLink = (
  key: string,
): key is typeof keysWithExecutionLinks[number] => {
  for (const workflowKey of keysWithExecutionLinks) {
    if (key === workflowKey) return true;
  }

  return false;
};

const keysWithTaskQueueLinks = ['taskQueueName'] as const;

export const shouldDisplayAsTaskQueueLink = (
  key: string,
): key is typeof keysWithTaskQueueLinks[number] => {
  for (const taskQueueKey of keysWithTaskQueueLinks) {
    if (key === taskQueueKey) return true;
  }

  return false;
};

const keysWithChildExecutionLinks = [
  'workflowExecutionWorkflowId',
  'workflowExecutionRunId',
] as const;

// For linking to a child workflow
export const shouldDisplayChildWorkflowLink = (
  key: string,
  attributes: CombinedAttributes,
): key is typeof keysWithChildExecutionLinks[number] => {
  const workflowLinkAttributesExist = Boolean(
    attributes?.workflowExecutionWorkflowId &&
      attributes?.workflowExecutionRunId,
  );
  for (const workflowKey of keysWithChildExecutionLinks) {
    if (key === workflowKey && workflowLinkAttributesExist) return true;
  }

  return false;
};

const formatSummaryValue = (key: string, value: unknown): SummaryAttribute => {
  if (typeof value === 'object') {
    const [firstKey] = Object.keys(value);
    return { key: key + capitalize(firstKey), value: value[firstKey] };
  } else {
    return { key, value: value.toString() };
  }
};

/**
 * A list of the keys that should be shown in the summary view.
 */
const preferredSummaryKeys = [
  'failure',
  'input',
  'activityType',
  'parentInitiatedEventId',
  'workflowExecution',
  'workflowType',
  'taskQueue',
] as const;

/**
 * Returns that first event attribute that is eligible to be displayed.
 */
const getFirstDisplayAttribute = ({
  attributes,
}: WorkflowEvent): SummaryAttribute => {
  for (const [key, value] of Object.entries(attributes)) {
    if (shouldDisplayAttribute(key, value)) {
      return formatSummaryValue(key, value);
    }
  }
};

/**
 * Iterates through the keys of an event and compares it with the list of
 * preferred keys. If a preferred key is found, it will be returned.
 * Otherwise, it will return the first eligible event attribute.
 */
const getSummaryAttribute = (event: WorkflowEvent): SummaryAttribute => {
  const first = getFirstDisplayAttribute(event);

  if (isLocalActivityMarkerEvent(event as MarkerRecordedEvent)) {
    const activityType =
      event.markerRecordedEventAttributes?.details?.data?.payloads?.[0]
        ?.ActivityType;
    if (activityType) {
      return formatSummaryValue('ActivityType', activityType);
    }
  }

  for (const [key, value] of Object.entries(event.attributes)) {
    for (const preferredKey of preferredSummaryKeys) {
      if (key === preferredKey && shouldDisplayAttribute(key, value))
        return formatSummaryValue(key, value);
    }
  }

  return first;
};

export const getSummaryForEventGroup = ({
  lastEvent,
}: EventGroup): SummaryAttribute => {
  return getSummaryAttribute(lastEvent);
};

export const getSingleAttributeForEvent = (
  event: WorkflowEvent | EventGroup,
): SummaryAttribute => {
  if (!event) return emptyAttribute;

  if (isEventGroup(event)) {
    return getSummaryForEventGroup(event);
  }

  return getSummaryAttribute(event);
};
