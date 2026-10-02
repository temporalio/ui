import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributeType,
} from '$lib/types/workflows';

import { isValidDate } from '../format-date';
import { isTimestamp, timestampToDate, type ValidTime } from '../format-time';
import { isInConditional } from '../is';
import { createFilter } from './to-list-workflow-filters';

export type QuickFilterValue =
  | ValidTime
  | boolean
  | string[]
  | null
  | undefined;

export const getDefaultConditional = (
  type: SearchAttributeType | undefined,
) => {
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

// Attributes that measure something, where an exact match is almost never what is
// wanted: `HistoryLength = 17` is rarely useful when `>= 17` is. These read as
// "at least this much" instead.
export const RANGE_PREFERRED_ATTRIBUTES = new Set([
  'ExecutionDuration',
  'HistoryLength',
  'HistorySizeBytes',
  'StateTransitionCount',
]);

// Typed Int, but its value is a duration string rather than a number.
const DURATION_ATTRIBUTE = 'ExecutionDuration';

export const getQuickFilterConditional = ({
  attribute,
  type,
}: {
  attribute: string;
  type: SearchAttributeType | undefined;
}) => {
  const isNumeric =
    type === SEARCH_ATTRIBUTE_TYPE.INT || type === SEARCH_ATTRIBUTE_TYPE.DOUBLE;

  if (isNumeric && RANGE_PREFERRED_ATTRIBUTES.has(attribute)) return '>=';

  return getDefaultConditional(type);
};

// The quick filter asks for an operator whenever `=` is not the sensible default, so
// the user picks rather than the table guessing.
export const requiresOperatorChoice = (input: {
  attribute: string;
  type: SearchAttributeType | undefined;
}): boolean => getQuickFilterConditional(input) !== '=';

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

// A time can reach a table cell as an ISO string, an epoch number, a Date or a
// protobuf Timestamp, so normalize to the ISO string the query expects.
const formatDatetimeValue = (value: QuickFilterValue): string | null => {
  if (isTimestamp(value)) return timestampToDate(value).toISOString();
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }
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
  attribute,
  type,
  value,
  conditional,
}: {
  attribute: string;
  type: SearchAttributeType;
  value: QuickFilterValue;
  conditional: string;
}): string | null => {
  // Already built as a duration string by the column, so it cannot go through the
  // numeric formatting its Int type would otherwise select.
  if (attribute === DURATION_ATTRIBUTE) {
    return typeof value === 'string' && value ? value : null;
  }

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

type QuickFilterInput = {
  attribute: string;
  type: SearchAttributeType | undefined;
  value: QuickFilterValue;
};

// The formatted value a quick filter would use, or null when the value cannot
// be filtered on. Building the filter itself is deferred until the click so
// rendering a cell does not generate a filter id it will never use.
export const toQuickFilterValue = ({
  attribute,
  type,
  value,
}: QuickFilterInput): string | null => {
  if (!attribute || !type) return null;

  return formatQuickFilterValue({
    attribute,
    type,
    value,
    conditional: getQuickFilterConditional({ attribute, type }),
  });
};

export const createQuickFilter = ({
  attribute,
  type,
  value,
}: QuickFilterInput): SearchAttributeFilter | null => {
  const formattedValue = toQuickFilterValue({ attribute, type, value });
  if (formattedValue === null || !type) return null;

  return createFilter({
    attribute,
    type,
    value: formattedValue,
    conditional: getQuickFilterConditional({ attribute, type }),
  });
};

export const isQuickFilterActive = (
  filters: SearchAttributeFilter[],
  quickFilter: Pick<
    SearchAttributeFilter,
    'attribute' | 'value' | 'conditional'
  > | null,
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
