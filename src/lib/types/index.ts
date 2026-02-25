import type { google, temporal } from '@temporalio/proto';

// api.workflowservice

export type DescribeNamespaceResponse =
  temporal.api.workflowservice.v1.IDescribeNamespaceResponse;
export type DescribeWorkflowExecutionResponse =
  temporal.api.workflowservice.v1.IDescribeWorkflowExecutionResponse;
export type ListNamespacesResponse =
  temporal.api.workflowservice.v1.IListNamespacesResponse;
export type GetClusterInfoResponse =
  temporal.api.workflowservice.v1.IGetClusterInfoResponse;
export type GetSystemInfoResponse =
  temporal.api.workflowservice.v1.IGetSystemInfoResponse;
export type Capabilities =
  temporal.api.workflowservice.v1.GetSystemInfoResponse.ICapabilities;
export type GetWorkflowExecutionHistoryResponse =
  temporal.api.workflowservice.v1.IGetWorkflowExecutionHistoryResponse;
export type GetSearchAttributesResponse =
  temporal.api.workflowservice.v1.IGetSearchAttributesResponse;
export type ListWorkflowExecutionsResponse =
  temporal.api.workflowservice.v1.IListWorkflowExecutionsResponse;
export type ListScheduleResponse =
  temporal.api.workflowservice.v1.IListSchedulesResponse;
export type DescribeScheduleResponse =
  temporal.api.workflowservice.v1.IDescribeScheduleResponse;
export type Schedule = temporal.api.schedule.v1.ISchedule;
export type CreateScheduleRequest =
  temporal.api.workflowservice.v1.ICreateScheduleRequest;
export type PatchScheduleRequest =
  temporal.api.workflowservice.v1.IPatchScheduleRequest;
export type UpdateScheduleRequest =
  temporal.api.workflowservice.v1.IUpdateScheduleRequest;
export type StartBatchOperationRequest =
  temporal.api.workflowservice.v1.IStartBatchOperationRequest;
export type CancelWorkflowRequest =
  temporal.api.workflowservice.v1.IRequestCancelWorkflowExecutionRequest;
export type ResetWorkflowRequest =
  temporal.api.workflowservice.v1.IResetWorkflowExecutionRequest;
export type UpdateWorkflowRequest =
  temporal.api.workflowservice.v1.IUpdateWorkflowExecutionRequest;
export type UpdateWorkflowResponse =
  temporal.api.workflowservice.v1.IUpdateWorkflowExecutionResponse;
export type PendingWorkflowTaskInfo =
  temporal.api.workflow.v1.IPendingWorkflowTaskInfo;
export type WorkflowExtendedInfo =
  temporal.api.workflow.v1.IWorkflowExecutionExtendedInfo;
export type PauseWorkflowRequest =
  temporal.api.workflowservice.v1.IPauseWorkflowExecutionRequest;
export type UnpauseWorkflowRequest =
  temporal.api.workflowservice.v1.IUnpauseWorkflowExecutionRequest;

// api.history

export type History = temporal.api.history.v1.IHistory;
export type HistoryEvent = temporal.api.history.v1.IHistoryEvent;
export type WorkflowExecutionStartedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionStartedEventAttributes;
export type WorkflowExecutionCompletedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionCompletedEventAttributes;
export type WorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionFailedEventAttributes;
export type WorkflowExecutionTimedOutEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionTimedOutEventAttributes;
export type WorkflowTaskScheduledEventAttributes =
  temporal.api.history.v1.IWorkflowTaskScheduledEventAttributes;
export type WorkflowTaskStartedEventAttributes =
  temporal.api.history.v1.IWorkflowTaskStartedEventAttributes;
export type WorkflowTaskCompletedEventAttributes =
  temporal.api.history.v1.IWorkflowTaskCompletedEventAttributes;
export type WorkflowTaskTimedOutEventAttributes =
  temporal.api.history.v1.IWorkflowTaskTimedOutEventAttributes;
export type WorkflowTaskFailedEventAttributes =
  temporal.api.history.v1.IWorkflowTaskFailedEventAttributes & {
    cause?: import('$types/workflows').WorkflowTaskFailedCause;
  };
export type ActivityTaskScheduledEventAttributes =
  temporal.api.history.v1.IActivityTaskScheduledEventAttributes;
export type ActivityTaskStartedEventAttributes =
  temporal.api.history.v1.IActivityTaskStartedEventAttributes;
export type ActivityTaskCompletedEventAttributes =
  temporal.api.history.v1.IActivityTaskCompletedEventAttributes;
export type ActivityTaskFailedEventAttributes =
  temporal.api.history.v1.IActivityTaskFailedEventAttributes;
export type ActivityTaskTimedOutEventAttributes =
  temporal.api.history.v1.IActivityTaskTimedOutEventAttributes;
export type TimerStartedEventAttributes =
  temporal.api.history.v1.ITimerStartedEventAttributes;
export type TimerFiredEventAttributes =
  temporal.api.history.v1.ITimerFiredEventAttributes;
export type ActivityTaskCancelRequestedEventAttributes =
  temporal.api.history.v1.IActivityTaskCancelRequestedEventAttributes;
export type ActivityTaskCanceledEventAttributes =
  temporal.api.history.v1.IActivityTaskCanceledEventAttributes;
export type TimerCanceledEventAttributes =
  temporal.api.history.v1.ITimerCanceledEventAttributes;
export type MarkerRecordedEventAttributes =
  temporal.api.history.v1.IMarkerRecordedEventAttributes;
export type WorkflowExecutionSignaledEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionSignaledEventAttributes;
export type WorkflowExecutionTerminatedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionTerminatedEventAttributes;
export type WorkflowExecutionCancelRequestedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionCancelRequestedEventAttributes;
export type WorkflowExecutionCanceledEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionCanceledEventAttributes;
export type RequestCancelExternalWorkflowExecutionInitiatedEventAttributes =
  temporal.api.history.v1.IRequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
export type RequestCancelExternalWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IRequestCancelExternalWorkflowExecutionFailedEventAttributes;
export type ExternalWorkflowExecutionCancelRequestedEventAttributes =
  temporal.api.history.v1.IExternalWorkflowExecutionCancelRequestedEventAttributes;
export type WorkflowExecutionContinuedAsNewEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionContinuedAsNewEventAttributes;
export type StartChildWorkflowExecutionInitiatedEventAttributes =
  temporal.api.history.v1.IStartChildWorkflowExecutionInitiatedEventAttributes;
export type StartChildWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IStartChildWorkflowExecutionFailedEventAttributes;
export type ChildWorkflowExecutionStartedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionStartedEventAttributes;
export type ChildWorkflowExecutionCompletedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionCompletedEventAttributes;
export type ChildWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionFailedEventAttributes;
export type ChildWorkflowExecutionCanceledEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionCanceledEventAttributes;
export type ChildWorkflowExecutionTimedOutEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionTimedOutEventAttributes;
export type ChildWorkflowExecutionTerminatedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionTerminatedEventAttributes;
export type SignalExternalWorkflowExecutionInitiatedEventAttributes =
  temporal.api.history.v1.ISignalExternalWorkflowExecutionInitiatedEventAttributes;
export type SignalExternalWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.ISignalExternalWorkflowExecutionFailedEventAttributes;
export type ExternalWorkflowExecutionSignaledEventAttributes =
  temporal.api.history.v1.IExternalWorkflowExecutionSignaledEventAttributes;
export type UpsertWorkflowSearchAttributesEventAttributes =
  temporal.api.history.v1.IUpsertWorkflowSearchAttributesEventAttributes;
export type ActivityTaskFailedByIdRequest =
  temporal.api.workflowservice.v1.IRespondActivityTaskFailedRequest;
export type ActivityTaskFailedByIdResponse =
  temporal.api.workflowservice.v1.IRespondActivityTaskFailedResponse;
export type ActivityTaskCompletedByIdRequest =
  temporal.api.workflowservice.v1.IRespondActivityTaskCompletedRequest;
export type ActivityTaskCompletedByIdResponse =
  temporal.api.workflowservice.v1.IRespondActivityTaskCompletedResponse;
export type ActivityPauseRequest =
  temporal.api.workflowservice.v1.IPauseActivityRequest;
export type ActivityPauseResponse =
  temporal.api.workflowservice.v1.IPauseActivityResponse;
export type ActivityUnpauseRequest =
  temporal.api.workflowservice.v1.IUnpauseActivityRequest;
export type ActivityUnpauseResponse =
  temporal.api.workflowservice.v1.IUnpauseActivityResponse;
export type ActivityResetRequest =
  temporal.api.workflowservice.v1.IResetActivityRequest;
export type ActivityResetResponse =
  temporal.api.workflowservice.v1.IResetActivityResponse;
export type ActivityUpdateOptionsRequest =
  temporal.api.workflowservice.v1.IUpdateActivityOptionsRequest;
export type ActivityUpdateOptionsResponse =
  temporal.api.workflowservice.v1.IUpdateActivityOptionsResponse;
export type ActivityOptions = temporal.api.activity.v1.IActivityOptions;

export type WorkflowPropertiesModifiedEventAttributes =
  temporal.api.history.v1.IWorkflowPropertiesModifiedEventAttributes;

// api.enums

export type WorkflowExecutionStatus =
  temporal.api.enums.v1.WorkflowExecutionStatus;
export type Severity = temporal.api.enums.v1.Severity;
export type ArchivalState = temporal.api.enums.v1.ArchivalState;
export type NamespaceState = temporal.api.enums.v1.NamespaceState;
export type TaskReachability = temporal.api.enums.v1.TaskReachability;
export type PendingNexusOperationState =
  temporal.api.enums.v1.PendingNexusOperationState;
export type CallbackState = temporal.api.enums.v1.CallbackState;
export type VersioningBehavior = temporal.api.enums.v1.VersioningBehavior;
export type EventType = temporal.api.enums.v1.EventType;

// temporal.api.enums.v1.ResetReapplyExcludeType
export enum ResetReapplyExcludeType {
  RESET_REAPPLY_EXCLUDE_TYPE_UNSPECIFIED = 0,
  RESET_REAPPLY_EXCLUDE_TYPE_SIGNAL = 1,
  RESET_REAPPLY_EXCLUDE_TYPE_UPDATE = 2,
}

// temporal.api.enums.v1.ResetReapplyType
export enum ResetReapplyType {
  RESET_REAPPLY_TYPE_UNSPECIFIED = 0,
  RESET_REAPPLY_TYPE_SIGNAL = 1,
  RESET_REAPPLY_TYPE_NONE = 2,
  RESET_REAPPLY_TYPE_ALL_ELIGIBLE = 3,
}

// api.workflow

export type PendingActivityInfo = temporal.api.workflow.v1.IPendingActivityInfo;
export type PendingChildrenInfo =
  temporal.api.workflow.v1.IPendingChildExecutionInfo;
export type PendingNexusInfo =
  temporal.api.workflow.v1.IPendingNexusOperationInfo;
export type CallbackInfo = temporal.api.workflow.v1.ICallbackInfo;
export type Callback = temporal.api.common.v1.ICallback;
export type WorkflowExecutionConfig =
  temporal.api.workflow.v1.IWorkflowExecutionConfig;
export type WorkflowExecutionInfo =
  temporal.api.workflow.v1.IWorkflowExecutionInfo;
export type WorkflowVersionTimpstamp =
  temporal.api.common.v1.IWorkerVersionStamp;
export type SearchAttribute = temporal.api.common.v1.ISearchAttributes;
export type Priority = temporal.api.common.v1.IPriority;

// api response
export type Payload = temporal.api.common.v1.IPayload;
export type Payloads = temporal.api.common.v1.IPayloads;
export type WorkflowExecutionInput = temporal.api.common.v1.IWorkflowExecution;
export type Memo = temporal.api.common.v1.IMemo;
export type Header = temporal.api.common.v1.IHeader;
export type ActivityType = temporal.api.common.v1.IActivityType;
export type RetryPolicy = temporal.api.common.v1.IRetryPolicy;

// api.taskqueue

export type TaskQueue = temporal.api.taskqueue.v1.ITaskQueue;
export type TaskQueueRequest =
  temporal.api.workflowservice.v1.IDescribeTaskQueueRequest;
export type TaskQueueResponse =
  temporal.api.workflowservice.v1.IDescribeTaskQueueResponse;
export type PollerInfo = temporal.api.taskqueue.v1.IPollerInfo;
export type TaskQueueStatus = temporal.api.taskqueue.v1.ITaskQueueStatus;
export type TaskQueueCompatibleVersionSet =
  temporal.api.taskqueue.v1.ICompatibleVersionSet;
export type BuildIdReachability = temporal.api.taskqueue.v1.BuildIdReachability;

// api.schedule

export type ScheduleListEntry = temporal.api.schedule.v1.IScheduleListEntry;
export type ScheduleSpec = temporal.api.schedule.v1.IScheduleSpec;
export type ScheduleState = temporal.api.schedule.v1.IScheduleState;
export type SchedulePolicies = temporal.api.schedule.v1.ISchedulePolicies;

export type CalendarSpec = temporal.api.schedule.v1.ICalendarSpec;
export type StructuredCalendarSpec =
  temporal.api.schedule.v1.IStructuredCalendarSpec;
export type IntervalSpec = temporal.api.schedule.v1.IIntervalSpec;
export type RangeSpec = temporal.api.schedule.v1.IRange;

export type ScheduleActionResult =
  temporal.api.schedule.v1.IScheduleActionResult;

// api.query
export type QueryResult = temporal.api.query.v1.IWorkflowQueryResult;

// api.operatorservice
export type ListSearchAttributesResponse =
  temporal.api.operatorservice.v1.IListSearchAttributesResponse;

// api.batch
export type BatchCancelOperation =
  temporal.api.batch.v1.IBatchOperationCancellation;
export type BatchTerminateOperation =
  temporal.api.batch.v1.IBatchOperationTermination;

// api.nexus
export type Endpoint = temporal.api.nexus.v1.IEndpoint;
export type EndpointSpec = temporal.api.nexus.v1.IEndpointSpec;
export type EventLink = temporal.api.common.v1.ILink;

// api.failure
export type Failure = temporal.api.failure.v1.IFailure;

// google

export type Timestamp = google.protobuf.ITimestamp;
export type Duration = google.protobuf.IDuration;

// extra APIs
export type SettingsResponse = {
  Auth: { Enabled: boolean; Options: string[] };
  Codec: {
    Endpoint: string;
    PassAccessToken?: boolean;
    IncludeCredentials?: boolean;
    DefaultErrorMessage?: string;
    DefaultErrorLink?: string;
  };
  DefaultNamespace: string;
  DisableWriteActions: boolean;
  WorkflowTerminateDisabled: boolean;
  WorkflowCancelDisabled: boolean;
  WorkflowSignalDisabled: boolean;
  WorkflowUpdateDisabled: boolean;
  WorkflowResetDisabled: boolean;
  WorkflowPauseDisabled: boolean;
  BatchActionsDisabled: boolean;
  StartWorkflowDisabled: boolean;
  HideWorkflowQueryErrors: boolean;
  RefreshWorkflowCountsDisabled: boolean;
  ActivityCommandsDisabled: boolean;
  ShowTemporalSystemNamespace: boolean;
  FeedbackURL: string;
  Version: string;
};

export type UserMetadata = temporal.api.sdk.v1.IUserMetadata;
