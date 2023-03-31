import type { google, temporal } from '@temporalio/proto';
type DescribeNamespaceResponse =
  temporal.api.workflowservice.v1.IDescribeNamespaceResponse;
type DescribeWorkflowExecutionResponse =
  temporal.api.workflowservice.v1.IDescribeWorkflowExecutionResponse;
type ListNamespacesResponse =
  temporal.api.workflowservice.v1.IListNamespacesResponse;
type GetClusterInfoResponse =
  temporal.api.workflowservice.v1.IGetClusterInfoResponse;
type GetWorkflowExecutionHistoryResponse =
  temporal.api.workflowservice.v1.IGetWorkflowExecutionHistoryResponse;
type GetSearchAttributesResponse =
  temporal.api.workflowservice.v1.IGetSearchAttributesResponse;
type ListWorkflowExecutionsResponse =
  temporal.api.workflowservice.v1.IListWorkflowExecutionsResponse;
type ListScheduleResponse =
  temporal.api.workflowservice.v1.IListSchedulesResponse;
type DescribeScheduleResponse =
  temporal.api.workflowservice.v1.IDescribeScheduleResponse;
type Schedule = temporal.api.schedule.v1.ISchedule;
type CreateScheduleRequest =
  temporal.api.workflowservice.v1.ICreateScheduleRequest;
type PatchScheduleRequest =
  temporal.api.workflowservice.v1.IPatchScheduleRequest;
type UpdateScheduleRequest =
  temporal.api.workflowservice.v1.IUpdateScheduleRequest;
type History = temporal.api.history.v1.IHistory;
type HistoryEvent = temporal.api.history.v1.IHistoryEvent;
type WorkflowExecutionStartedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionStartedEventAttributes;
type WorkflowExecutionCompletedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionCompletedEventAttributes;
type WorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionFailedEventAttributes;
type WorkflowExecutionTimedOutEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionTimedOutEventAttributes;
type WorkflowTaskScheduledEventAttributes =
  temporal.api.history.v1.IWorkflowTaskScheduledEventAttributes;
type WorkflowTaskStartedEventAttributes =
  temporal.api.history.v1.IWorkflowTaskStartedEventAttributes;
type WorkflowTaskCompletedEventAttributes =
  temporal.api.history.v1.IWorkflowTaskCompletedEventAttributes;
type WorkflowTaskTimedOutEventAttributes =
  temporal.api.history.v1.IWorkflowTaskTimedOutEventAttributes;
type WorkflowTaskFailedEventAttributes =
  temporal.api.history.v1.IWorkflowTaskFailedEventAttributes;
type ActivityTaskScheduledEventAttributes =
  temporal.api.history.v1.IActivityTaskScheduledEventAttributes;
type ActivityTaskStartedEventAttributes =
  temporal.api.history.v1.IActivityTaskStartedEventAttributes;
type ActivityTaskCompletedEventAttributes =
  temporal.api.history.v1.IActivityTaskCompletedEventAttributes;
type ActivityTaskFailedEventAttributes =
  temporal.api.history.v1.IActivityTaskFailedEventAttributes;
type ActivityTaskTimedOutEventAttributes =
  temporal.api.history.v1.IActivityTaskTimedOutEventAttributes;
type TimerStartedEventAttributes =
  temporal.api.history.v1.ITimerStartedEventAttributes;
type TimerFiredEventAttributes =
  temporal.api.history.v1.ITimerFiredEventAttributes;
type ActivityTaskCancelRequestedEventAttributes =
  temporal.api.history.v1.IActivityTaskCancelRequestedEventAttributes;
type ActivityTaskCanceledEventAttributes =
  temporal.api.history.v1.IActivityTaskCanceledEventAttributes;
type TimerCanceledEventAttributes =
  temporal.api.history.v1.ITimerCanceledEventAttributes;
type MarkerRecordedEventAttributes =
  temporal.api.history.v1.IMarkerRecordedEventAttributes;
type WorkflowExecutionSignaledEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionSignaledEventAttributes;
type WorkflowExecutionTerminatedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionTerminatedEventAttributes;
type WorkflowExecutionCancelRequestedEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionCanceledEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionCanceledEventAttributes;
type RequestCancelExternalWorkflowExecutionInitiatedEventAttributes =
  temporal.api.history.v1.IRequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
type RequestCancelExternalWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IRequestCancelExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionCancelRequestedEventAttributes =
  temporal.api.history.v1.IExternalWorkflowExecutionCancelRequestedEventAttributes;
type WorkflowExecutionContinuedAsNewEventAttributes =
  temporal.api.history.v1.IWorkflowExecutionContinuedAsNewEventAttributes;
type StartChildWorkflowExecutionInitiatedEventAttributes =
  temporal.api.history.v1.IStartChildWorkflowExecutionInitiatedEventAttributes;
type StartChildWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IStartChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionStartedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionStartedEventAttributes;
type ChildWorkflowExecutionCompletedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionCompletedEventAttributes;
type ChildWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionFailedEventAttributes;
type ChildWorkflowExecutionCanceledEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionCanceledEventAttributes;
type ChildWorkflowExecutionTimedOutEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionTimedOutEventAttributes;
type ChildWorkflowExecutionTerminatedEventAttributes =
  temporal.api.history.v1.IChildWorkflowExecutionTerminatedEventAttributes;
type SignalExternalWorkflowExecutionInitiatedEventAttributes =
  temporal.api.history.v1.ISignalExternalWorkflowExecutionInitiatedEventAttributes;
type SignalExternalWorkflowExecutionFailedEventAttributes =
  temporal.api.history.v1.ISignalExternalWorkflowExecutionFailedEventAttributes;
type ExternalWorkflowExecutionSignaledEventAttributes =
  temporal.api.history.v1.IExternalWorkflowExecutionSignaledEventAttributes;
type UpsertWorkflowSearchAttributesEventAttributes =
  temporal.api.history.v1.IUpsertWorkflowSearchAttributesEventAttributes;
type StartBatchOperationRequest =
  temporal.api.workflowservice.v1.IStartBatchOperationRequest;
type WorkflowExecutionStatus = temporal.api.enums.v1.WorkflowExecutionStatus;
type Severity = temporal.api.enums.v1.Severity;
type WorkflowTaskFailedCause = temporal.api.enums.v1.WorkflowTaskFailedCause;
type ArchivalState = temporal.api.enums.v1.ArchivalState;
type PendingActivityInfo = temporal.api.workflow.v1.IPendingActivityInfo;
type PendingChildrenInfo = temporal.api.workflow.v1.IPendingChildExecutionInfo;
type WorkflowExecutionInfo = temporal.api.workflow.v1.IWorkflowExecutionInfo;
type Payload = temporal.api.common.v1.IPayload;
type Payloads = temporal.api.common.v1.IPayloads;
type WorkflowExecutionInput = temporal.api.common.v1.IWorkflowExecution;
type PollerInfo = temporal.api.taskqueue.v1.IPollerInfo;
type TaskQueueStatus = temporal.api.taskqueue.v1.ITaskQueueStatus;
type ScheduleListEntry = temporal.api.schedule.v1.IScheduleListEntry;
type ScheduleSpec = temporal.api.schedule.v1.IScheduleSpec;
type ScheduleState = temporal.api.schedule.v1.IScheduleState;
type SchedulePolicies = temporal.api.schedule.v1.ISchedulePolicies;
type CalendarSpec = temporal.api.schedule.v1.ICalendarSpec;
type IntervalSpec = temporal.api.schedule.v1.IIntervalSpec;
type ScheduleActionResult = temporal.api.schedule.v1.IScheduleActionResult;
type Timestamp = google.protobuf.ITimestamp;
type SettingsResponse = {
  Auth: {
    Enabled: boolean;
    Options: string[];
  };
  Codec: {
    Endpoint: string;
    PassAccessToken?: boolean;
    IncludeCredentials?: boolean;
  };
  DefaultNamespace: string;
  DisableWriteActions: boolean;
  WorkflowTerminateDisabled: boolean;
  WorkflowCancelDisabled: boolean;
  WorkflowSignalDisabled: boolean;
  WorkflowResetDisabled: boolean;
  BatchActionsDisabled: boolean;
  ShowTemporalSystemNamespace: boolean;
  NotifyOnNewVersion: boolean;
  FeedbackURL: string;
  Version: string;
};
