import { get } from 'svelte/store';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { searchAttributes } from '$lib/stores/search-attributes';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
import { formatDate } from '$lib/utilities/format-date';

import { isStatusAttribute } from './quick-filter';

export function isStatusFilter({ attribute }: SearchAttributeFilter) {
  return isStatusAttribute(attribute);
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

export function formatListFilterValue(value: string | null): string[] {
  if (!value) return [];
  if (value.startsWith('(') && value.endsWith(')')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((v) => v.trim().slice(1, -1));
  }
  return [value];
}

export const formatDateTimeRange = (
  value: string,
  format: string,
  relative: boolean,
) => {
  const [conditon, start, operator, end] = value.split(' ');
  return `${conditon.toLowerCase()} ${formatDate(
    start.replace(/"/g, ''),
    format,
    {
      relative,
      format: 'short',
    },
  )} ${operator.toLowerCase()} ${formatDate(end.replace(/"/g, ''), format, {
    relative,
    format: 'short',
  })}`;
};
