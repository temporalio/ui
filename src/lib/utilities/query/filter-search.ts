import { get } from 'svelte/store';

import { searchAttributes } from '$lib/stores/search-attributes';

export function isStatusFilter(attribute: string) {
  return attribute === 'ExecutionStatus';
}

export function isTextFilter(attribute: string, attributes = searchAttributes) {
  const searchAttributeType = get(attributes)[attribute];
  if (isStatusFilter(attribute)) return false;
  return ['Keyword', 'Text'].includes(searchAttributeType);
}

export function isListFilter(attribute: string, attributes = searchAttributes) {
  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === 'KeywordList';
}

export function isNumberFilter(
  attribute: string,
  attributes = searchAttributes,
) {
  const searchAttributeType = get(attributes)[attribute];
  return ['Int', 'Double'].includes(searchAttributeType);
}

export function isDateTimeFilter(
  attribute: string,
  attributes = searchAttributes,
) {
  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === 'Datetime';
}

export function isBooleanFilter(
  attribute: string,
  attributes = searchAttributes,
) {
  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === 'Bool';
}
