import { get } from 'svelte/store';

import type { WorkflowFilter } from '$lib/models/workflow-filters';
import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
import type { SearchAttributes } from '$lib/types/workflows';

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

const isValid = (value: unknown): boolean => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (typeof value === 'string' && value === 'undefined') return false;

  return true;
};

const toFilterQueryStatement = (
  attribute: keyof SearchAttributes,
  value: FilterValue,
  conditional = '=',
  archived: boolean,
  customDate: boolean,
): string => {
  const queryKey = filterKeys[attribute] ?? attribute;

  if (value === 'All') return '';

  // Custom Dates...
  if (customDate) {
    return `${queryKey} ${value}`;
  }

  if (isDuration(value) || isDurationString(value)) {
    if (archived || get(supportsAdvancedVisibility)) {
      return `${queryKey} > "${toDate(value)}"`;
    }
    return `${queryKey} BETWEEN "${toDate(value)}" AND "${tomorrow()}"`;
  }

  return `${queryKey}${conditional}"${value}"`;
};

const toQueryStatementsFromFilters = (
  filters: WorkflowFilter[],
  archived: boolean,
): string[] => {
  return filters
    .map(
      ({
        attribute,
        value,
        conditional,
        operator,
        parenthesis,
        customDate,
      }) => {
        if (isValid(value)) {
          let statement = toFilterQueryStatement(
            attribute,
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
  filters: WorkflowFilter[] = [],
  archived = false,
): string => {
  return toQueryStatementsFromFilters(filters, archived).join('');
};
