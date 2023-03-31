import type { PendingChildren } from './events';

export type WorkflowExecutionStatus = import('$types').WorkflowExecutionStatus;
export type WorkflowTaskFailedCause = import('$types').WorkflowTaskFailedCause;
export type ListWorkflowExecutionsResponse =
  import('$types').ListWorkflowExecutionsResponse;

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

export type WorkflowExecutionFilters = {
  type: WorkflowType;
  status: WorkflowStatus;
};

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

export type WorkflowExecution = {
  name: string;
  id: string;
  runId: string;
  startTime: string;
  endTime: string;
  status: WorkflowStatus;
  taskQueue?: string;
  historyEvents: number;
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
