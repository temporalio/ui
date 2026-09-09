import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
  type SearchAttributeType,
} from '$lib/types/workflows';

export const SORT_COLUMN_PARAM = 'sort';
export const SORT_ORDER_PARAM = 'sort-order';

export type SortOrder = 'asc' | 'desc';

export type WorkflowSort = {
  attribute: string;
  order: SortOrder;
};

const unsortableTypes: readonly SearchAttributeType[] = [
  SEARCH_ATTRIBUTE_TYPE.TEXT,
  SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
  SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED,
] as const;

export const columnSortAttributes: Readonly<Record<string, string>> = {
  Status: 'ExecutionStatus',
  'Workflow ID': 'WorkflowId',
  'Run ID': 'RunId',
  Type: 'WorkflowType',
  Start: 'StartTime',
  End: 'CloseTime',
  'Execution Time': 'ExecutionTime',
  'Execution Duration': 'ExecutionDuration',
  'History Size': 'HistorySizeBytes',
  'History Length': 'HistoryLength',
  'State Transitions': 'StateTransitionCount',
  'Task Queue': 'TaskQueue',
  'Scheduled By ID': 'TemporalScheduledById',
  'Scheduled Start Time': 'TemporalScheduledStartTime',
  Deployment: 'TemporalWorkerDeployment',
  'Deployment Version': 'TemporalWorkerDeploymentVersion',
  'Versioning Behavior': 'TemporalWorkflowVersioningBehavior',
  'Build ID': 'TemporalWorkerBuildId',
  'Change Version': 'TemporalChangeVersion',
} as const;

export const toSortAttribute = (
  label: string,
  searchAttributes: SearchAttributes = {},
): string | undefined => {
  const attribute = columnSortAttributes[label] ?? label;
  const type = searchAttributes[attribute];

  if (!type) return undefined;
  if (unsortableTypes.includes(type)) return undefined;

  return attribute;
};

export const toWorkflowSort = (
  searchParams: URLSearchParams,
): WorkflowSort | undefined => {
  const attribute = searchParams.get(SORT_COLUMN_PARAM);

  if (!attribute) return undefined;

  const order: SortOrder =
    searchParams.get(SORT_ORDER_PARAM) === 'asc' ? 'asc' : 'desc';

  return { attribute, order };
};

const escapeAttribute = (attribute: string): string =>
  /\s/.test(attribute) ? `\`${attribute}\`` : attribute;

export const toQueryWithOrderBy = (
  query = '',
  sort: WorkflowSort | undefined = undefined,
): string => {
  if (!sort?.attribute) return query;

  const orderBy = `order by ${escapeAttribute(sort.attribute)} ${sort.order}`;

  return query ? `${query} ${orderBy}` : orderBy;
};

const orderByUnsupportedMessages = [
  "'order by' clause",
  'order by clause is not supported',
  'unable to sort by search attribute',
];

export const isOrderByUnsupportedError = (
  message: string | undefined,
): boolean => {
  if (!message) return false;

  const normalizedMessage = message.toLowerCase();

  return orderByUnsupportedMessages.some((unsupportedMessage) =>
    normalizedMessage.includes(unsupportedMessage),
  );
};
