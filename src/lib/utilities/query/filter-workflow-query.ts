import { get } from 'svelte/store';

import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

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

type QueryFilter = {
  attribute: string;
  type: string;
  value: FilterValue | null | undefined;
  operator: string;
  parenthesis: string;
  conditional: string;
  customDate?: boolean;
};

const filterKeys: Readonly<Record<string, QueryKey>> = {
  workflowId: 'WorkflowId',
  workflowType: 'WorkflowType',
  timeRange: 'StartTime',
  executionStatus: 'ExecutionStatus',
  closeTime: 'CloseTime',
  runId: 'RunId',
} as const;

const isValid = (value: unknown, conditional: string): boolean => {
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
  type: string;
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
  if (
    type === SEARCH_ATTRIBUTE_TYPE.INT ||
    type === SEARCH_ATTRIBUTE_TYPE.DOUBLE
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
  attribute: string,
  type: string,
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

  return `\`${queryKey}\`${conditional}${formatValue({
    value,
    type,
    conditional,
  })}`;
};

const toQueryStatementsFromFilters = (
  filters: QueryFilter[],
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
            value as FilterValue,
            conditional,
            archived,
            customDate ?? false,
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
    .filter((statement): statement is string => Boolean(statement));
};

export const toListWorkflowQueryFromFilters = (
  filters: QueryFilter[] = [],
  archived = false,
): string => {
  return toQueryStatementsFromFilters(filters, archived).join('');
};
