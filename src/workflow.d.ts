type WorkflowExecutionStatus = import('$types').WorkflowExecutionStatus;
type WorkflowTaskFailedCause = import('$types').WorkflowTaskFailedCause;

/**
 * Replace Longs, ITimestamps, UInt8Array's etc. with their corresponding http values
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
    searchAttributes?: WorkflowSearchAttributes;
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

type WorkflowSearchAttributes = {
  indexedFields?: Record<string, Payload>;
};

type DecodedWorkflowSearchAttributes = {
  indexedFields?: Record<string, string | Payload>;
};

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
  searchAttributes?: DecodedWorkflowSearchAttributes;
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
