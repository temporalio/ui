import { get } from 'svelte/store';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
  type SearchAttributeType,
} from '$lib/types/workflows';

import {
  isContains,
  isInConditional,
  isNullConditional,
  isStartsWith,
} from '../is';
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

const isValid = (value: unknown, conditional: string): boolean => {
  if (value === null && !isNullConditional(conditional)) return false;
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
  if (
    type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST &&
    isInConditional(conditional)
  ) {
    return value;
  }
  return `"${value}"`;
};

const getQueryKey = (attribute: string | number) => {
  const key = filterKeys[attribute] ?? attribute;
  if (typeof key === 'string' && /\s/g.test(key)) {
    return '`' + key + '`';
  }
  return key;
};

const toFilterQueryStatement = (
  attribute: keyof SearchAttributes,
  type: SearchAttributeType,
  value: FilterValue,
  conditional = '=',
  archived: boolean,
  customDate: boolean,
): string => {
  const queryKey = getQueryKey(attribute);

  if (value === 'All') return '';

  // Custom Dates...
  if (customDate) {
    return `${queryKey} ${value}`;
  }

  if (isNullConditional(conditional)) {
    return `\`${queryKey}\` ${conditional} ${value}`;
  }

  if (isDuration(value) || isDurationString(value)) {
    if (archived || get(supportsAdvancedVisibility)) {
      return `${queryKey} ${conditional} "${toDate(value)}"`;
    }
    return `${queryKey} BETWEEN "${toDate(value)}" AND "${tomorrow()}"`;
  }

  if (isStartsWith(conditional)) {
    return `\`${queryKey}\` ${conditional} ${formatValue({
      value,
      type,
      conditional,
    })}`;
  }

  if (isContains(conditional)) {
    return `\`${queryKey}\` ${conditional} ${formatValue({
      value,
      type,
      conditional,
    })}`;
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
      }) => {
        if (isValid(value, conditional)) {
          let statement = toFilterQueryStatement(
            attribute,
            type,
            value,
            conditional,
            archived,
            customDate,
          );
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
    .filter(Boolean);
};

export const toListWorkflowQueryFromFilters = (
  filters: SearchAttributeFilter[] = [],
  archived = false,
): string => {
  return toQueryStatementsFromFilters(filters, archived).join('');
};
