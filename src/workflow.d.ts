type WorkflowExecutionStatus = import('$types').WorkflowExecutionStatus;
type WorkflowTaskFailedCause = import('$types').WorkflowTaskFailedCause;
/**
 * Replace Longs, ITimestamps, etc. with their corresponding http values
 */
type WorkflowExecutionInfo = Replace<
  import('$types').WorkflowExecutionInfo,
  {
    status: WorkflowStatus;
    stateTransitionCount: string;
    startTime: string;
    closeTime: string;
    historySizeBytes: string;
    historyLength: string;
  }
>;

type ListWorkflowExecutionsResponse = Replace<
  import('$types').ListWorkflowExecutionsResponse,
  Optional<{ executions: WorkflowExecutionInfo[] }>
>;

type WorkflowExecutionConfig = Replace<
  import('$types').WorkflowExecutionConfig,
  { defaultWorkflowTaskTimeout: Duration }
>;

type WorkflowExecutionAPIResponse = Optional<{
  workflowExecutionInfo: WorkflowExecutionInfo;
  pendingActivities: PendingActivityInfo[];
  pendingChildren: PendingChildren[];
  executionConfig: WorkflowExecutionConfig;
}>;

type Decodable = {
  searchAttributes: import('$types').WorkflowSearchAttributes;
  memo: import('$types').Memo;
  header: import('$types').Header;
  queryResult: import('$types').QueryResult;
};

type DecodedPayload = import('$types').Payload | Record<any, any> | string;

type Decoded = {
  searchAttributes: { indexedFields: Record<string, DecodedPayload> };
  memo: { fields: Record<string, DecodedPayload> };
  header: { fields: Record<string, DecodedPayload> };
  queryResult: Replace<
    import('$types').QueryResult,
    { answer: Array<DecodedPayload> }
  >;
};

type WorkflowStatus =
  | 'Running'
  | 'TimedOut'
  | 'Completed'
  | 'Failed'
  | 'Completed'
  | 'ContinuedAsNew'
  | 'Canceled'
  | 'Terminated'
  | null;

type WorkflowType = string | null;

type WorkflowExecutionFilters = {
  type: WorkflowType;
  status: WorkflowStatus;
};

type FilterParameters = {
  workflowId?: string;
  workflowType?: string;
  executionStatus?: WorkflowStatus;
  timeRange?: Duration | string;
  query?: string;
};

type ArchiveFilterParameters = Omit<FilterParameters, 'timeRange'> & {
  closeTime?: Duration | string;
};

type WorkflowIdentifier = IWorkflowExecution;

type WorkflowExecution = {
  name: string;
  id: string;
  runId: string;
  startTime: string;
  endTime: string;
  status: WorkflowStatus;
  taskQueue?: string;
  historyEvents: string;
  historySizeBytes: string;
  searchAttributes?: { indexedFields: Record<string, DecodedPayload> };
  memo?: { fields: Record<string, DecodedPayload> };
  pendingChildren: PendingChildren[];
  pendingActivities: PendingActivity[];
  stateTransitionCount: string;
  parentNamespaceId?: string;
  parent?: WorkflowIdentifier;
  url: string;
  isRunning: boolean;
  defaultWorkflowTaskTimeout: Duration;
  canBeTerminated: boolean;
};

type BatchOperationType = 'Terminate' | 'Cancel' | 'Signal';
type BatchOperationStatus = 'Running' | 'Complete' | 'Failed' | 'Unspecified';

type BatchOperationInfo = {
  operationType: BatchOperationType;
  jobId: string;
  state: BatchOperationStatus;
  startTime: string;
  closeTime: string;
  totalOperationCount: string;
  completeOperationCount: string;
  failureOperationCount: string;
  identity: string;
  reason: string;
};
