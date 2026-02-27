import { isEvent } from '$lib/models/event-history';
import type { Payloads } from '$lib/types';
import type {
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
} from '$lib/types/events';
import type { Payload } from '$lib/types/events';
import { capitalize } from '$lib/utilities/format-camel-case';

import { decodePayload, isSinglePayload } from './decode-payload';
import type { CombinedAttributes } from './format-event-attributes';
import { has } from './has';
import { isObject } from './is';
import {
  isLocalActivityMarkerEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
} from './is-event-type';
import {
  isPendingActivity,
  isPendingNexusOperation,
} from './is-pending-activity';

export type SummaryAttribute = {
  key: string;
  value: string | Record<string, unknown> | Payloads;
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

const keysToOmitIfNoValue: Readonly<Set<string>> = new Set([
  'suggestContinueAsNew',
  'historySizeBytes',
  'targetWorkerDeploymentVersionChanged',
]);

export const shouldDisplayAttribute = (
  key: string,
  value: unknown,
): key is string => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (value === '0s') return false;
  if (key === 'type') return false;
  if ((!value || value === '0') && keysToOmitIfNoValue.has(key)) return false;

  return true;
};

export const pendingActivityKeys = [
  'attempt',
  'maximumAttempts',
  'heartbeatDetails',
  'lastHeartbeatTime',
  'lastFailure',
  'lastStartedTime',
  'scheduledTime',
  'expirationTime',
  'lastWorkerIdentity',
];

export const shouldDisplayPendingAttribute = (key: string): key is string => {
  return pendingActivityKeys.includes(key);
};

export const shouldDisplayGroupAttribute = (
  key: string,
  value: unknown,
): key is string => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (value === '0s') return false;
  if (key === 'type') return false;
  if (key === 'workflowId') return false;
  if (key === 'initiatedEventId') return false;
  if (key === 'startedEventId') return false;
  if (key === 'scheduledEventId') return false;
  if (key === 'activityId') return false;
  if (key === 'namespace') return false;
  if (key === 'namespaceId') return false;
  if (key === 'workflowTaskCompletedEventId') return false;
  if (key === 'taskQueueKind') return false;

  if ((!value || value === '0') && keysToOmitIfNoValue.has(key)) return false;

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

  return [value?.payloads, value?.indexedFields, value?.points, value].find(
    (v) => v !== undefined,
  );
};

export const getStackTrace = (value: unknown) => {
  if (!isObject(value)) return undefined;
  if (has(value, 'stackTrace') && value.stackTrace) return value.stackTrace;

  for (const key in value) {
    if (isObject(value[key])) {
      return getStackTrace(value[key]);
    }
  }
};

const keysWithExecutionLinks = [
  'baseRunId',
  'continuedExecutionRunId',
  'firstExecutionRunId',
  'newExecutionRunId',
  'newRunId',
  'originalExecutionRunId',
] as const;

export type EventLinkType =
  | 'execution'
  | 'task-queue'
  | 'child-workflow'
  | 'nexus-endpoint'
  | 'none';

export const displayLinkType = (
  key: string,
  attributes: CombinedAttributes,
): EventLinkType => {
  if (shouldDisplayAsExecutionLink(key)) return 'execution';
  if (shouldDisplayAsTaskQueueLink(key)) return 'task-queue';
  if (shouldDisplayChildWorkflowLink(key, attributes)) return 'child-workflow';
  if (shouldDisplayNexusEndpointLink(key)) return 'nexus-endpoint';
  return 'none';
};

// For linking to same workflow but different execution
export const shouldDisplayAsExecutionLink = (
  key: string,
): key is (typeof keysWithExecutionLinks)[number] => {
  for (const workflowKey of keysWithExecutionLinks) {
    if (key === workflowKey) return true;
  }

  return false;
};

const keysWithTaskQueueLinks = ['taskQueueName'] as const;

export const shouldDisplayAsTaskQueueLink = (
  key: string,
): key is (typeof keysWithTaskQueueLinks)[number] => {
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
): key is (typeof keysWithChildExecutionLinks)[number] => {
  const workflowLinkAttributesExist = Boolean(
    attributes?.workflowExecutionWorkflowId &&
    attributes?.workflowExecutionRunId,
  );
  for (const workflowKey of keysWithChildExecutionLinks) {
    if (key === workflowKey && workflowLinkAttributesExist) return true;
  }

  return false;
};

const keysWithNexusEndpointLinks = ['endpointId'] as const;

export const shouldDisplayNexusEndpointLink = (key: string): boolean => {
  for (const endpointKey of keysWithNexusEndpointLinks) {
    if (key === endpointKey) return true;
  }

  return false;
};

export const shouldDisplayAsTime = (key: string): boolean => {
  return key?.toLowerCase()?.endsWith('time');
};

export const formatSummaryValue = (
  key: string,
  value: unknown,
): SummaryAttribute => {
  if (typeof value === 'object') {
    if (isSinglePayload(value)) {
      return { key, value };
    }
    const [firstKey] = Object.keys(value);
    if (!firstKey) {
      return { key, value: {} };
    }
    if (firstKey === 'payloads') {
      return { key, value };
    }
    return { key: key + capitalize(firstKey), value: value[firstKey] };
  } else {
    return { key, value: value.toString() };
  }
};

/**
 * A list of the keys that should be shown in the summary view.
 */
const preferredSummaryKeys = [
  'activityType',
  'signalName',
  'workflowType',
  'result',
  'failure',
  'input',
  'outcome',
  'workflowExecution',
  'taskQueue',
  'startToFireTimeout',
  'attempt',
  'historySizeBytes',
  'identity',
  'parentInitiatedEventId',
  'endpointId',
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

export const getActivityType = (payload: Payload) => {
  if (has(payload, 'ActivityType')) return payload.ActivityType;
  if (has(payload, 'activity_type')) return payload.activity_type;
  if (typeof payload === 'string') return payload;
};

const isJavaSDK = (event: WorkflowEvent): boolean => {
  return !!event.markerRecordedEventAttributes?.details?.type?.payloads;
};

/**
 * Iterates through the keys of an event and compares it with the list of
 * preferred keys. If a preferred key is found, it will be returned.
 * Otherwise, it will return the first eligible event attribute.
 */

export const getEventSummaryAttribute = (
  event: WorkflowEvent,
): SummaryAttribute => {
  const first = getFirstDisplayAttribute(event);

  if (isLocalActivityMarkerEvent(event)) {
    const payloads = (event.markerRecordedEventAttributes?.details?.data
      ?.payloads ||
      event.markerRecordedEventAttributes?.details?.type?.payloads ||
      []) as unknown as Payload[];
    const decodedPayloads = payloads.map((p) => decodePayload(p));
    const payload = decodedPayloads?.[0];
    if (isJavaSDK(event) && payload) {
      return formatSummaryValue('ActivityType', payload);
    }
    const activityType = getActivityType(payload);
    if (activityType) {
      return formatSummaryValue('ActivityType', activityType);
    }
  }

  if (isWorkflowExecutionUpdateAcceptedEvent(event)) {
    if (event.attributes?.acceptedRequest?.input?.name) {
      return {
        key: 'name',
        value: event.attributes.acceptedRequest.input.name,
      };
    }
  }

  for (const preferredKey of preferredSummaryKeys) {
    for (const [key, value] of Object.entries(event.attributes)) {
      if (key === preferredKey && shouldDisplayAttribute(key, value)) {
        return formatSummaryValue(key, value);
      }
    }
  }

  return first || emptyAttribute;
};

export const getPendingActivitySummaryAttribute = (
  event: PendingActivity,
): SummaryAttribute => {
  return { key: 'attempt', value: event.attempt.toString() };
};

export const getPendingNexusOperationSummaryAttribute = (
  event: PendingNexusOperation,
): SummaryAttribute => {
  if (!event.attempt) return emptyAttribute;
  return { key: 'attempt', value: event.attempt.toString() };
};

export const getSummaryAttribute = (
  event: WorkflowEvent | PendingActivity | PendingNexusOperation,
): SummaryAttribute => {
  if (isEvent(event)) return getEventSummaryAttribute(event);
  if (isPendingActivity(event))
    return getPendingActivitySummaryAttribute(event);
  if (isPendingNexusOperation(event))
    return getPendingNexusOperationSummaryAttribute(event);
  return emptyAttribute;
};

export const getPrimaryAttributeForEvent = (
  event: WorkflowEvent,
): SummaryAttribute => {
  if (!event) return emptyAttribute;

  return getSummaryAttribute(event);
};

export const getSecondaryAttributeForEvent = (
  event: WorkflowEvent,
  primaryKey: string,
): SummaryAttribute => {
  if (!event || !event?.attributes) return emptyAttribute;

  for (const preferredKey of preferredSummaryKeys) {
    for (const [key, value] of Object.entries(event.attributes)) {
      if (
        key === preferredKey &&
        key !== primaryKey &&
        shouldDisplayAttribute(key, value)
      ) {
        return formatSummaryValue(key, value);
      }
    }
  }

  return emptyAttribute;
};
