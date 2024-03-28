import type {
  Memo,
  Payloads,
  WorkflowExecutionStatus,
  WorkflowVersionTimpstamp,
} from '$lib/types';

import type {
  Payload,
  PendingActivity,
  PendingActivityInfo,
  PendingChildren,
} from './events';
import type { Optional, Replace } from './global';

/**
 * Replace Longs, ITimestamps, UInt8Array's etc. with their corresponding http values
 */
export type WorkflowExecutionInfo = Replace<
  import('$lib/types').WorkflowExecutionInfo,
  {
    status: WorkflowExecutionStatus | WorkflowStatus;
    stateTransitionCount: string;
    startTime: string;
    closeTime: string;
    executionTime: string;
    historySizeBytes: string;
    historyLength: string;
    searchAttributes?: WorkflowSearchAttributes;
    memo?: Memo;
  }
>;

export type ListWorkflowExecutionsResponse = Replace<
  import('$lib/types').ListWorkflowExecutionsResponse,
  Optional<{ executions: WorkflowExecutionInfo[] }>
>;

export type CountWorkflowExecutionsResponse = {
  count?: string;
  groups?: { count: string; groupValues: Payloads }[];
};

export type WorkflowExecutionConfig = Replace<
  import('$lib/types').WorkflowExecutionConfig,
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

export type WorkflowIdentifier = import('$lib/types').WorkflowExecutionInput;

export type SearchAttributesValue =
  | 'Bool'
  | 'Datetime'
  | 'Double'
  | 'Int'
  | 'Keyword'
  | 'Text'
  | 'KeywordList';

export type SearchAttributes = {
  [k: string]: SearchAttributesValue;
};

export type SearchAttributesResponse = {
  customAttributes: Record<string, SearchAttributesValue>;
  systemAttributes: Record<string, SearchAttributesValue>;
  storageSchema: import('$lib/types').ListSearchAttributesResponse['storageSchema'];
};

export type WorkflowSearchAttributes = {
  indexedFields?: Record<string, Payload>;
};

export type DecodedWorkflowSearchAttributes = {
  indexedFields?: Record<string, string | Payload>;
};

export interface MostRecentWOrkflowVersionStamp
  extends WorkflowVersionTimpstamp {
  useVersioning?: boolean;
}

export type WorkflowExecution = {
  name: string;
  id: string;
  runId: string;
  startTime: string;
  endTime: string;
  executionTime: string;
  status: WorkflowStatus;
  taskQueue?: string;
  historyEvents: string;
  historySizeBytes: string;
  mostRecentWorkerVersionStamp?: MostRecentWOrkflowVersionStamp;
  searchAttributes?: DecodedWorkflowSearchAttributes;
  memo: Memo;
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

export type WorkflowTaskFailedCause =
  | 'Unspecified'
  | 'UnhandledCommand'
  | 'BadScheduleActivityAttributes'
  | 'BadRequestCancelActivityAttributes'
  | 'BadStartTimerAttributes'
  | 'BadCancelTimerAttributes'
  | 'BadRecordMarkerAttributes'
  | 'BadCompleteWorkflowExecutionAttributes'
  | 'BadFailWorkflowExecutionAttributes'
  | 'BadCancelWorkflowExecutionAttributes' // correct ?
  | 'BadRequestCancelExternalAttributes'
  | 'BadContinueAsNewAttributes'
  | 'StartTimerDuplicateId'
  | 'ResetStickyTaskQueue'
  | 'WorkflowWorkerUnhandledFailure'
  | 'WorkflowTaskHeartbeatError'
  | 'BadSignalWorkflowExecutionAttributes'
  | 'BadStartChildExecutionAttributes'
  | 'ForceCloseCommand'
  | 'FailoverCloseCommand'
  | 'BadSignalInputSize'
  | 'ResetWorkflow'
  | 'BadBinary'
  | 'ScheduleActivityDuplicateId'
  | 'BadSearchAttributes'
  | 'NonDeterministicError'
  | 'BadModifyWorkflowPropertiesAttributes'
  | 'PendingChildWorkflowsLimitExceeded'
  | 'PendingActivitiesLimitExceeded'
  | 'PendingSignalsLimitExceeded'
  | 'PendingRequestCancelLimitExceeded'
  | 'BadUpdateWorkflowExecutionMessage'
  | 'UnhandledUpdate';
