import type {
  PendingChildren,
  PendingActivityInfo,
  PendingActivity,
  Payload,
} from './events';
import type { Replace, Optional } from './global';

export type WorkflowExecutionStatus = import('$types').WorkflowExecutionStatus;
export type WorkflowTaskFailedCause = import('$types').WorkflowTaskFailedCause;

/**
 * Replace Longs, ITimestamps, UInt8Array's etc. with their corresponding http values
 */
export type WorkflowExecutionInfo = Replace<
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

export type ListWorkflowExecutionsResponse = Replace<
  import('$types').ListWorkflowExecutionsResponse,
  Optional<{ executions: WorkflowExecutionInfo[] }>
>;

export type WorkflowExecutionConfig = Replace<
  import('$types').WorkflowExecutionConfig,
  { defaultWorkflowTaskTimeout: Duration }
>;

export type WorkflowExecutionAPIResponse = Optional<{
  workflowExecutionInfo: WorkflowExecutionInfo;
  pendingActivities: PendingActivityInfo[];
  pendingChildren: PendingChildren[];
  executionConfig: WorkflowExecutionConfig;
}>;

export type WorkflowStatus =
  | 'Running'
  | 'TimedOut'
  | 'Completed'
  | 'Failed'
  | 'Completed'
  | 'ContinuedAsNew'
  | 'Canceled'
  | 'Terminated'
  | null;

export type WorkflowType = string | null;

export type FilterParameters = {
  workflowId?: string;
  workflowType?: string;
  executionStatus?: WorkflowStatus;
  timeRange?: Duration | string;
  query?: string;
};

export type ArchiveFilterParameters = Omit<FilterParameters, 'timeRange'> & {
  closeTime?: Duration | string;
};

export type WorkflowIdentifier = import('$types').WorkflowExecutionInput;

export type WorkflowSearchAttributes = {
  indexedFields?: Record<string, Payload>;
};

export type DecodedWorkflowSearchAttributes = {
  indexedFields?: Record<string, string | Payload>;
};

export type WorkflowExecution = {
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

export type BatchOperationType = 'Terminate' | 'Cancel' | 'Signal';
export type BatchOperationStatus =
  | 'Running'
  | 'Complete'
  | 'Failed'
  | 'Unspecified';

export type BatchOperationInfo = {
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
