import { get } from 'svelte/store';

import { searchAttributes } from '$lib/stores/search-attributes';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributeType,
} from '$lib/types/workflows';

export function isStatusFilter(attribute: string) {
  return attribute === 'ExecutionStatus';
}

type FilterAttributeAndType = {
  attribute: string;
  type?: SearchAttributeType;
};

export function isTextFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (isStatusFilter(attribute)) return false;
  if (type === SEARCH_ATTRIBUTE_TYPE.KEYWORD) return true;

  const searchAttributeType = get(attributes)[attribute];
  return [
    SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    SEARCH_ATTRIBUTE_TYPE.TEXT,
    'String',
  ].includes(searchAttributeType);
}

export function isListFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST) return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST;
}

export function isNumberFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.INT) return true;

  const searchAttributeType = get(attributes)[attribute];
  return (
    searchAttributeType === SEARCH_ATTRIBUTE_TYPE.INT ||
    searchAttributeType === SEARCH_ATTRIBUTE_TYPE.DOUBLE
  );
}

export function isDurationFilter(attribute: string) {
  return ['ExecutionDuration'].includes(attribute);
}

export function isDateTimeFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.DATETIME) return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === SEARCH_ATTRIBUTE_TYPE.DATETIME;
}

export function isBooleanFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === SEARCH_ATTRIBUTE_TYPE.BOOL) return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === SEARCH_ATTRIBUTE_TYPE.BOOL;
}

export function getFocusedElementId({
  attribute,
  type,
}: FilterAttributeAndType) {
  if (isStatusFilter(attribute)) return 'status-filter';

  if (
    isTextFilter({ attribute, type }) ||
    isNumberFilter({ attribute, type }) ||
    isDateTimeFilter({ attribute, type })
  )
    return 'conditional-menu-button';

  if (isListFilter({ attribute, type })) return 'list-filter';

  if (isBooleanFilter({ attribute, type })) return 'boolean-filter';

  return '';
}
