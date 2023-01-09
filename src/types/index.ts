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
  temporal.api.history.v1.IWorkflowTaskFailedEventAttributes;
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

// api.enums

export type WorkflowExecutionStatus =
  temporal.api.enums.v1.WorkflowExecutionStatus;
export type Severity = temporal.api.enums.v1.Severity;
export type WorkflowTaskFailedCause =
  temporal.api.enums.v1.WorkflowTaskFailedCause;

// api.workflow

export type PendingActivityInfo = temporal.api.workflow.v1.IPendingActivityInfo;
export type PendingChildrenInfo =
  temporal.api.workflow.v1.IPendingChildExecutionInfo;

export type WorkflowExecutionInfo =
  temporal.api.workflow.v1.IWorkflowExecutionInfo;

// api response
export type Payload = temporal.api.common.v1.IPayload;
export type Payloads = temporal.api.common.v1.IPayloads;

// api.taskqueue

export type PollerInfo = temporal.api.taskqueue.v1.IPollerInfo;
export type TaskQueueStatus = temporal.api.taskqueue.v1.ITaskQueueStatus;

// api.schedule

export type ScheduleListEntry = temporal.api.schedule.v1.IScheduleListEntry;
export type ScheduleSpec = temporal.api.schedule.v1.IScheduleSpec;
export type ScheduleState = temporal.api.schedule.v1.IScheduleState;
export type SchedulePolicies = temporal.api.schedule.v1.ISchedulePolicies;

export type CalendarSpec = temporal.api.schedule.v1.ICalendarSpec;
export type IntervalSpec = temporal.api.schedule.v1.IIntervalSpec;
export type ScheduleActionResult =
  temporal.api.schedule.v1.IScheduleActionResult;

// google

export type Timestamp = google.protobuf.ITimestamp;

// extra APIs
export type SettingsResponse = {
  Auth: { Enabled: boolean; Options: string[] };
  Codec: { Endpoint: string; PassAccessToken?: boolean };
  DefaultNamespace: string;
  DisableWriteActions: boolean;
  WorkflowTerminateDisabled: boolean;
  WorkflowCancelDisabled: boolean;
  WorkflowSignalDisabled: boolean;
  WorkflowResetDisabled: boolean;
  ShowTemporalSystemNamespace: boolean;
  NotifyOnNewVersion: boolean;
  FeedbackURL: string;
  Version: string;
};
