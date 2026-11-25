import { get } from 'svelte/store';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
  type SearchAttributeType,
} from '$lib/types/workflows';

import { isInConditional, isNullConditional, isStartsWith } from '../is';
import { isDuration, isDurationString, toDate, tomorrow } from '../to-duration';

export type QueryKey =
  | 'WorkflowId'
  | 'WorkflowType'
  | 'StartTime'
  | 'CloseTime'
  | 'ExecutionTime'
  | 'ExecutionStatus'
  | 'RunId';

type FilterValue = string | Duration;

const filterKeys: Readonly<Record<string, QueryKey>> = {
  workflowId: 'WorkflowId',
  workflowType: 'WorkflowType',
  timeRange: 'StartTime',
  executionStatus: 'ExecutionStatus',
  closeTime: 'CloseTime',
  runId: 'RunId',
} as const;

export const isValidFilterValue = (
  value: unknown,
  conditional: string,
): boolean => {
  if (isNullConditional(conditional)) return true;
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (typeof value === 'string' && value === 'undefined') return false;

  return true;
};

const formatValue = ({
  value,
  type,
  conditional,
}: {
  value: string;
  type: SearchAttributeType;
  conditional: string;
}): string | boolean => {
  if (type === SEARCH_ATTRIBUTE_TYPE.BOOL) {
    return value.toLowerCase() === 'true' ? true : false;
  }
  if (isInConditional(conditional)) {
    return value;
  }
  if (
    type === SEARCH_ATTRIBUTE_TYPE.INT ||
    type === SEARCH_ATTRIBUTE_TYPE.DOUBLE
  ) {
    return value;
  }
  return `"${value}"`;
};

const getQueryKey = (attribute: string | number) =>
  String(filterKeys[attribute] ?? attribute);

const getBareQueryKey = (key: string) => (/\s/.test(key) ? `\`${key}\`` : key);

const toFilterQueryStatement = (
  attribute: keyof SearchAttributes,
  type: SearchAttributeType,
  value: FilterValue,
  conditional = '=',
  archived: boolean,
  customDate: boolean,
  negated: boolean,
): string => {
  const queryKey = getQueryKey(attribute);
  const bareQueryKey = getBareQueryKey(queryKey);

  if (value === 'All') return '';

  // Custom Dates...
  if (customDate) {
    return `${bareQueryKey} ${value}`;
  }

  if (isNullConditional(conditional)) {
    return `\`${queryKey}\` ${conditional} null`;
  }

  if (attribute === 'ExecutionDuration') {
    const isNanoseconds = /^\d+$/.test(String(value));
    if (isNanoseconds) {
      return `\`${queryKey}\`${conditional}${value}`;
    }
    return `\`${queryKey}\`${conditional}"${value}"`;
  }

  if (isDuration(value) || isDurationString(value)) {
    if (archived || get(supportsAdvancedVisibility)) {
      return `${bareQueryKey} ${conditional} "${toDate(value)}"`;
    }
    return `${bareQueryKey} BETWEEN "${toDate(value)}" AND "${tomorrow()}"`;
  }

  if (isStartsWith(conditional)) {
    return `\`${queryKey}\` ${negated ? 'NOT ' : ''}${conditional} ${formatValue(
      {
        value,
        type,
        conditional,
      },
    )}`;
  }

  return `\`${queryKey}\`${conditional}${formatValue({
    value,
    type,
    conditional,
  })}`;
};

const toQueryStatementsFromFilters = (
  filters: SearchAttributeFilter[],
  archived: boolean,
): string[] => {
  return filters
    .map(
      ({
        attribute,
        type,
        value,
        conditional,
        operator,
        parenthesis,
        customDate,
        negated,
      }) => {
        if (isValidFilterValue(value, conditional)) {
          let statement = toFilterQueryStatement(
            attribute,
            type,
            value,
            conditional,
            archived,
            customDate ?? false,
            negated ?? false,
          );
          if (negated && statement && !isStartsWith(conditional)) {
            statement = `NOT ${statement}`;
          }
          if (parenthesis === '(') {
            statement = `(${statement}`;
          } else if (parenthesis === ')') {
            statement = `${statement})`;
          }
          if (operator) {
            statement = `${statement} ${operator}` + ' ';
          }
          return statement;
        }
      },
    )
    .filter((statement): statement is string => Boolean(statement));
};

export const toListWorkflowQueryFromFilters = (
  filters: SearchAttributeFilter[] = [],
  archived = false,
): string => {
  return toQueryStatementsFromFilters(filters, archived).join('');
};
