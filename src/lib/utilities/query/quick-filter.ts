import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributeType,
} from '$lib/types/workflows';

import { isValidDate } from '../format-date';
import { isInConditional } from '../is';
import { createFilter } from './to-list-workflow-filters';

export type QuickFilterValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

export const getDefaultConditional = (type: SearchAttributeType) => {
  switch (type) {
    case SEARCH_ATTRIBUTE_TYPE.BOOL:
      return '=';
    case SEARCH_ATTRIBUTE_TYPE.DATETIME:
      return '>=';
    case SEARCH_ATTRIBUTE_TYPE.INT:
      return '=';
    case SEARCH_ATTRIBUTE_TYPE.DOUBLE:
      return '=';
    case SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST:
      return 'in';
    case SEARCH_ATTRIBUTE_TYPE.KEYWORD:
      return '=';
    case SEARCH_ATTRIBUTE_TYPE.TEXT:
      return '=';
    default:
      return '=';
  }
};

const formatBoolValue = (value: QuickFilterValue): string | null => {
  if (typeof value === 'boolean') return String(value);
  if (typeof value !== 'string') return null;

  const normalized = value.toLowerCase();
  if (normalized === 'true' || normalized === 'false') return normalized;
  return null;
};

const formatNumberValue = (value: QuickFilterValue): string | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : null;
  }
  if (typeof value !== 'string' || !value.trim()) return null;

  return Number.isFinite(Number(value)) ? value.trim() : null;
};

const formatDatetimeValue = (value: QuickFilterValue): string | null => {
  if (typeof value !== 'string' || !value) return null;
  return isValidDate(value) ? value : null;
};

const formatKeywordListValue = (
  value: QuickFilterValue,
  conditional: string,
): string | null => {
  const values = Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item !== '')
    : typeof value === 'string' && value
      ? [value]
      : [];

  if (!values.length) return null;
  if (!isInConditional(conditional)) return values.join(', ');

  return `(${values.map((item) => `"${item}"`).join(', ')})`;
};

export const formatQuickFilterValue = ({
  type,
  value,
  conditional,
}: {
  type: SearchAttributeType;
  value: QuickFilterValue;
  conditional: string;
}): string | null => {
  switch (type) {
    case SEARCH_ATTRIBUTE_TYPE.BOOL:
      return formatBoolValue(value);
    case SEARCH_ATTRIBUTE_TYPE.INT:
    case SEARCH_ATTRIBUTE_TYPE.DOUBLE:
      return formatNumberValue(value);
    case SEARCH_ATTRIBUTE_TYPE.DATETIME:
      return formatDatetimeValue(value);
    case SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST:
      return formatKeywordListValue(value, conditional);
    case SEARCH_ATTRIBUTE_TYPE.KEYWORD:
    case SEARCH_ATTRIBUTE_TYPE.TEXT:
      return typeof value === 'string' && value ? value : null;
    default:
      return null;
  }
};

export const createQuickFilter = ({
  attribute,
  type,
  value,
}: {
  attribute: string;
  type: SearchAttributeType | undefined;
  value: QuickFilterValue;
}): SearchAttributeFilter | null => {
  if (!attribute || !type) return null;

  const conditional = getDefaultConditional(type);
  const formattedValue = formatQuickFilterValue({ type, value, conditional });
  if (formattedValue === null) return null;

  return createFilter({ attribute, type, value: formattedValue, conditional });
};

export const isQuickFilterActive = (
  filters: SearchAttributeFilter[],
  quickFilter: SearchAttributeFilter | null,
): boolean => {
  if (!quickFilter) return false;

  const filtersForAttribute = filters.filter(
    (filter) => filter.attribute === quickFilter.attribute,
  );

  return (
    filtersForAttribute.length === 1 &&
    filtersForAttribute[0].value === quickFilter.value &&
    filtersForAttribute[0].conditional === quickFilter.conditional &&
    !filtersForAttribute[0].customDate
  );
};

export const toggleQuickFilter = (
  filters: SearchAttributeFilter[],
  quickFilter: SearchAttributeFilter,
): SearchAttributeFilter[] => {
  const otherFilters = filters.filter(
    (filter) => filter.attribute !== quickFilter.attribute,
  );

  return isQuickFilterActive(filters, quickFilter)
    ? otherFilters
    : [...otherFilters, quickFilter];
};
