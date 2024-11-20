import { get } from 'svelte/store';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { searchAttributes } from '$lib/stores/search-attributes';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

export function isStatusFilter({ attribute }: SearchAttributeFilter) {
  return attribute === 'ExecutionStatus';
}

export function isTextFilter(
  filter: SearchAttributeFilter,
  attributes = searchAttributes,
) {
  const { attribute, type } = filter;
  if (isStatusFilter(filter)) return false;
  if (type === SEARCH_ATTRIBUTE_TYPE.KEYWORD) return true;

  const searchAttributeType = get(attributes)[attribute];
  return [
    SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    SEARCH_ATTRIBUTE_TYPE.TEXT,
    'String',
  ].includes(searchAttributeType);
}

export function isListFilter(
  { attribute, type }: SearchAttributeFilter,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST) return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST;
}

export function isNumberFilter(
  { attribute, type }: SearchAttributeFilter,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.INT) return true;

  const searchAttributeType = get(attributes)[attribute];
  return (
    searchAttributeType === SEARCH_ATTRIBUTE_TYPE.INT ||
    searchAttributeType === SEARCH_ATTRIBUTE_TYPE.DOUBLE
  );
}

export function isDurationFilter({ attribute }: SearchAttributeFilter) {
  return ['ExecutionDuration'].includes(attribute);
}

export function isDateTimeFilter(
  { attribute, type }: SearchAttributeFilter,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.DATETIME) return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === SEARCH_ATTRIBUTE_TYPE.DATETIME;
}

export function isBooleanFilter(
  { attribute, type }: SearchAttributeFilter,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.BOOL) return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === SEARCH_ATTRIBUTE_TYPE.BOOL;
}

export function getFocusedElementId(filter: SearchAttributeFilter) {
  if (isStatusFilter(filter)) return 'status-filter';

  if (
    isTextFilter(filter) ||
    isNumberFilter(filter) ||
    isDateTimeFilter(filter)
  )
    return 'conditional-menu-button';

  if (isListFilter(filter)) return 'list-filter';

  if (isBooleanFilter(filter)) return 'boolean-filter';

  return '';
}
