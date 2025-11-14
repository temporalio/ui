import { get } from 'svelte/store';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { searchAttributes } from '$lib/stores/search-attributes';
import type { TimeFormat, TimestampFormat } from '$lib/stores/time-format';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
import { formatDate } from '$lib/utilities/format-date';

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
    isDateTimeFilter(filter) ||
    isListFilter(filter)
  )
    return 'conditional-menu-button';

  if (isBooleanFilter(filter)) return 'boolean-filter';

  return '';
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
  format: TimeFormat,
  timestampFormat: TimestampFormat,
  relative: boolean,
) => {
  const [conditon, start, operator, end] = value.split(' ');
  return `${conditon.toLowerCase()} ${formatDate(
    start.replace(/"/g, ''),
    format,
    timestampFormat,
    {
      relative,
      abbrFormat: true,
    },
  )} ${operator.toLowerCase()} ${formatDate(
    end.replace(/"/g, ''),
    format,
    timestampFormat,
    {
      relative,
      abbrFormat: true,
    },
  )}`;
};
