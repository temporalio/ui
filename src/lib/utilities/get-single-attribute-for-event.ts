type SummaryAttribute = { key: string; value: string };

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

const formatSummaryValue = (key: string, value: unknown): SummaryAttribute => {
  if (typeof value === 'object') {
    const [firstKey] = Object.keys(value);
    return { key: `${key}.${firstKey}`, value: value[firstKey] };
  } else {
    return { key, value: value.toString() };
  }
};

/**
 * A list of the keys that should be shown in the summary view.
 */
const preferredSummaryKeys = ['activityType'] as const;

/**
 * Returns that first event attribute that is eligible to be displayed.
 */
const getFirstDisplayAttribute = ({
  attributes,
}: HistoryEventWithId): { key: string; value: string } => {
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
const getPreferredSummaryAttribute = (
  event: HistoryEventWithId,
): SummaryAttribute => {
  const first = getFirstDisplayAttribute(event);

  for (const [key, value] of Object.entries(event.attributes)) {
    for (const preferredKey of preferredSummaryKeys) {
      if (key === preferredKey) return formatSummaryValue(key, value);
    }
  }

  return first;
};

const getSummaryForEventGroup = (
  eventGroup: CompactEventGroup,
): SummaryAttribute => {
  let input = '';
  const attributes = eventGroup.initialEvent.attributes;

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'input') input = value;
  }

  return { key: 'input', value: input };
};

export const getSingleAttributeForEvent = ({
  event,
  eventGroup,
}: {
  event: HistoryEventWithId | null;
  eventGroup: CompactEventGroup | null;
}): SummaryAttribute => {
  let summaryAttribute = emptyAttribute;
  if (!event && !eventGroup) return summaryAttribute;

  if (eventGroup) {
    return getSummaryForEventGroup(eventGroup);
  }

  return getPreferredSummaryAttribute(event);
};
