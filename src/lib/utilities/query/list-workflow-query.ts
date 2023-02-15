import type {
  WorkflowFilter,
  WorkflowSort,
} from '$lib/models/workflow-filters';
import { isDuration, isDurationString, toDate, tomorrow } from '../to-duration';
import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';
import { get } from 'svelte/store';

export type QueryKey =
  | 'WorkflowId'
  | 'WorkflowType'
  | 'StartTime'
  | 'CloseTime'
  | 'ExecutionTime'
  | 'ExecutionStatus';

export type FilterKey =
  | 'workflowId'
  | 'workflowType'
  | 'timeRange'
  | 'executionStatus'
  | 'closeTime';

type FilterValue = string | Duration;

const queryKeys: Readonly<Record<string, QueryKey>> = {
  workflowId: 'WorkflowId',
  workflowType: 'WorkflowType',
  timeRange: 'StartTime',
  executionStatus: 'ExecutionStatus',
  closeTime: 'CloseTime',
} as const;

const filterKeys: Readonly<FilterKey[]> = [
  'workflowId',
  'workflowType',
  'timeRange',
  'executionStatus',
  'closeTime',
] as const;

const isValid = (value: unknown): boolean => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (typeof value === 'string' && value === 'undefined') return false;

  return true;
};

const isAdvancedValid = (value: unknown): boolean => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return true;
  if (typeof value === 'string' && value === 'undefined') return false;

  return true;
};

export const isFilterKey = (key: unknown): key is FilterKey => {
  if (typeof key !== 'string') return false;

  for (const filterKey of filterKeys) {
    if (filterKey === key) return true;
  }

  return false;
};

const toQueryStatement = (
  key: FilterKey,
  value: FilterValue,
  archived: boolean,
): string => {
  const queryKey = queryKeys[key];

  if (value === 'All') return '';

  if (isDuration(value) || isDurationString(value)) {
    if (archived || get(supportsAdvancedVisibility)) {
      return `${queryKey} > "${toDate(value)}"`;
    }
    return `${queryKey} BETWEEN "${toDate(value)}" AND "${tomorrow()}"`;
  }

  return `${queryKey}="${value}"`;
};

const toFilterQueryStatement = (
  attribute: keyof SearchAttributes,
  value: FilterValue,
  conditional = '=',
  archived: boolean,
  customDate: boolean,
): string => {
  const queryKey = queryKeys[attribute] ?? attribute;

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

const toQueryStatements = (
  parameters: FilterParameters | ArchiveFilterParameters,
  archived: boolean,
): string[] => {
  return Object.entries(parameters)
    .map(([key, value]) => {
      if (isFilterKey(key) && isValid(value))
        return toQueryStatement(key, value, archived);
    })
    .filter(Boolean);
};

export const toListWorkflowQuery = (
  parameters: FilterParameters | ArchiveFilterParameters,
  archived = false,
): string => {
  return toQueryStatements(parameters, archived).join(' and ');
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
        if (isAdvancedValid(value)) {
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
  sorts: WorkflowSort[] = [],
  archived = false,
): string => {
  const sortStatement = sorts.length
    ? ` order by ${sorts[0].attribute} ${sorts[0].value}`
    : '';
  return (
    toQueryStatementsFromFilters(filters, archived).join('') + sortStatement
  );
};
