import { formatDate } from '$lib/utilities/format-date';
import {
  shouldDisplayAttribute,
  shouldDisplayNestedAttribute,
} from '$lib/utilities/get-single-attribute-for-event';

type CombinedAttributes = EventAttribute & {
  eventTime?: string;
};

const keysToOmit: Readonly<Set<string>> = new Set(['header']);

const keysToExpand: Readonly<Set<string>> = new Set([
  'taskQueue',
  'retryPolicy',
]);

const keysToDeeplyExpand: Readonly<Set<string>> = new Set([
  'searchAttributes',
  'retryPolicy',
]);

const keysToOmitIfEmpty: Readonly<Set<string>> = new Set([
  'nonRetryableErrorTypes',
]);

const capitalize = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const formatNestedAttributes = (
  attributes: CombinedAttributes,
  key: string,
  value: any,
) => {
  if (keysToExpand.has(key) && typeof attributes[key] === 'object') {
    for (const [nestedKey, nestedValue] of Object.entries(attributes[key])) {
      const shouldDisplayNested = shouldDisplayNestedAttribute(key, value);
      if (!keysToOmitIfEmpty.has(nestedKey) && shouldDisplayNested) {
        attributes[`${key}${capitalize(nestedKey)}`] = nestedValue;
      }
    }
    delete attributes[key];
  } else {
    formatDeeplyNestedAttributes(attributes, key, value);
  }
};

const formatDeeplyNestedAttributes = (
  attributes: CombinedAttributes,
  key: string,
  value: any,
) => {
  if (keysToDeeplyExpand.has(key) && typeof attributes[key] === 'object') {
    for (const [nestedKey, nestedValue] of Object.entries(attributes[key])) {
      const shouldDisplayNested = shouldDisplayNestedAttribute(key, value);
      if (!keysToOmitIfEmpty.has(nestedKey) && shouldDisplayNested) {
        attributes[`${key}${capitalize(nestedKey)}`] = nestedValue;
      }
    }
    delete attributes[key];
  }
};

export const formatAttributes = (
  event: IterableEvent,
  { compact } = { compact: false },
): CombinedAttributes => {
  const attributes: CombinedAttributes = {};

  if (compact) attributes.eventTime = formatDate(event.eventTime);

  for (const [key, value] of Object.entries(event.attributes)) {
    const shouldDisplay = shouldDisplayAttribute(key, value);
    if (!keysToOmit.has(key) && shouldDisplay) attributes[key] = value;
    formatNestedAttributes(attributes, key, value);
  }

  return attributes;
};
