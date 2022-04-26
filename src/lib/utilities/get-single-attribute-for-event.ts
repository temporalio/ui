import { isEventGroup } from '$lib/models/event-groups';
import { getLastEvent } from '$lib/models/event-groups/get-last-event';

type SummaryAttribute = {
  key: string;
  value: string | Record<string, unknown>;
};

const emptyAttribute: SummaryAttribute = { key: '', value: '' };

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

const keysWithWorkflowLinks = [
  'baseRunId',
  'continuedExecutionRunId',
  'firstExecutionRunId',
  'newExecutionRunId',
  'newRunId',
  'originalExecutionRunId',
] as const;

export const shouldDisplayAsWorkflowLink = (
  key: string,
): key is typeof keysWithWorkflowLinks[number] => {
  for (const workflowKey of keysWithWorkflowLinks) {
    if (key === workflowKey) return true;
  }

  return false;
};

const capitalize = (word: string): string => {
  return word[0].toUpperCase() + word.slice(1);
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

  for (const [key, value] of Object.entries(event.attributes)) {
    for (const preferredKey of preferredSummaryKeys) {
      if (key === preferredKey && shouldDisplayAttribute(key, value))
        return formatSummaryValue(key, value);
    }
  }

  return first;
};

export const getSummaryForEventGroup = (
  eventGroup: EventGroup,
): SummaryAttribute => {
  const event = getLastEvent(eventGroup);

  return getSummaryAttribute(event);
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
