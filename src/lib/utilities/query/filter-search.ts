import { get } from 'svelte/store';

import { searchAttributes } from '$lib/stores/search-attributes';

export function isStatusFilter(attribute: string) {
  return attribute === 'ExecutionStatus';
}

export function isTextFilter(attribute: string, attributes = searchAttributes) {
  const searchAttributeType = get(attributes)[attribute];
  if (isStatusFilter(attribute)) return false;
  return ['Keyword', 'Text', 'String'].includes(searchAttributeType);
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

export function isDurationFilter(attribute: string) {
  return ['ExecutionDuration'].includes(attribute);
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

export function getFocusedElementId(attribute: string) {
  if (isStatusFilter(attribute)) return 'status-filter';

  if (
    isTextFilter(attribute) ||
    isNumberFilter(attribute) ||
    isDateTimeFilter(attribute)
  )
    return 'conditional-menu-button';

  if (isListFilter(attribute)) return 'list-filter-search';

  if (isBooleanFilter(attribute)) return 'boolean-filter';

  return '';
}
