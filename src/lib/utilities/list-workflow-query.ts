import { isDuration, toDate } from './to-duration';

type QueryKey =
  | 'WorkflowId'
  | 'WorkflowType'
  | 'StartTime'
  | 'CloseTime'
  | 'ExecutionTime'
  | 'ExecutionStatus';

type FilterKey =
  | 'workflowId'
  | 'workflowType'
  | 'timeRange'
  | 'executionStatus';

type FilterValue = string | Duration;

const queryKeys: Readonly<Record<string, QueryKey>> = {
  workflowId: 'WorkflowId',
  workflowType: 'WorkflowType',
  timeRange: 'StartTime',
  executionStatus: 'ExecutionStatus',
} as const;

const filterKeys: Readonly<FilterKey[]> = [
  'workflowId',
  'workflowType',
  'timeRange',
  'executionStatus',
] as const;

const isFilterKey = (key: unknown): key is FilterKey => {
  if (typeof key !== 'string') return false;

  for (const filterKey of filterKeys) {
    if (filterKey === key) return true;
  }

  return false;
};

const toQueryStatement = (key: FilterKey, value: FilterValue): string => {
  if (isDuration(value)) value = toDate(value);
  const queryKey = queryKeys[key];
  return `${queryKey}="${value}"`;
};

const toQueryStatements = (parameters: FilterParameters): string[] => {
  return Object.entries(parameters).map(([key, value]) => {
    if (isFilterKey(key)) return toQueryStatement(key, value);
  });
};

export const toListWorkflowQuery = (parameters: FilterParameters): string => {
  return toQueryStatements(parameters).join(' and ');
};

export const fromListWorkflowQuery = (query: string): FilterParameters => {
  return {};
};
