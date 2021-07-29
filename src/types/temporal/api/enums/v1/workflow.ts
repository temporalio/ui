/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.enums.v1';

export enum WorkflowIdReusePolicy {
  WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED = 0,
  /** WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE - Allow start a workflow execution using the same workflow Id, when workflow not running. */
  WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE = 1,
  /**
   * WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY - Allow start a workflow execution using the same workflow Id, when workflow not running, and the last execution close state is in
   * [terminated, cancelled, timed out, failed].
   */
  WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY = 2,
  /** WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE - Do not allow start a workflow execution using the same workflow Id at all. */
  WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE = 3,
  UNRECOGNIZED = -1,
}

export function workflowIdReusePolicyFromJSON(
  object: any,
): WorkflowIdReusePolicy {
  switch (object) {
    case 0:
    case 'WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED':
      return WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED;
    case 1:
    case 'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE':
      return WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE;
    case 2:
    case 'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY':
      return WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY;
    case 3:
    case 'WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE':
      return WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return WorkflowIdReusePolicy.UNRECOGNIZED;
  }
}

export function workflowIdReusePolicyToJSON(
  object: WorkflowIdReusePolicy,
): string {
  switch (object) {
    case WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED:
      return 'WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED';
    case WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE:
      return 'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE';
    case WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY:
      return 'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY';
    case WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE:
      return 'WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE';
    default:
      return 'UNKNOWN';
  }
}

export enum ParentClosePolicy {
  PARENT_CLOSE_POLICY_UNSPECIFIED = 0,
  /** PARENT_CLOSE_POLICY_TERMINATE - Terminate means terminating the child workflow. */
  PARENT_CLOSE_POLICY_TERMINATE = 1,
  /** PARENT_CLOSE_POLICY_ABANDON - Abandon means not doing anything on the child workflow. */
  PARENT_CLOSE_POLICY_ABANDON = 2,
  /** PARENT_CLOSE_POLICY_REQUEST_CANCEL - Cancel means requesting cancellation on the child workflow. */
  PARENT_CLOSE_POLICY_REQUEST_CANCEL = 3,
  UNRECOGNIZED = -1,
}

export function parentClosePolicyFromJSON(object: any): ParentClosePolicy {
  switch (object) {
    case 0:
    case 'PARENT_CLOSE_POLICY_UNSPECIFIED':
      return ParentClosePolicy.PARENT_CLOSE_POLICY_UNSPECIFIED;
    case 1:
    case 'PARENT_CLOSE_POLICY_TERMINATE':
      return ParentClosePolicy.PARENT_CLOSE_POLICY_TERMINATE;
    case 2:
    case 'PARENT_CLOSE_POLICY_ABANDON':
      return ParentClosePolicy.PARENT_CLOSE_POLICY_ABANDON;
    case 3:
    case 'PARENT_CLOSE_POLICY_REQUEST_CANCEL':
      return ParentClosePolicy.PARENT_CLOSE_POLICY_REQUEST_CANCEL;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ParentClosePolicy.UNRECOGNIZED;
  }
}

export function parentClosePolicyToJSON(object: ParentClosePolicy): string {
  switch (object) {
    case ParentClosePolicy.PARENT_CLOSE_POLICY_UNSPECIFIED:
      return 'PARENT_CLOSE_POLICY_UNSPECIFIED';
    case ParentClosePolicy.PARENT_CLOSE_POLICY_TERMINATE:
      return 'PARENT_CLOSE_POLICY_TERMINATE';
    case ParentClosePolicy.PARENT_CLOSE_POLICY_ABANDON:
      return 'PARENT_CLOSE_POLICY_ABANDON';
    case ParentClosePolicy.PARENT_CLOSE_POLICY_REQUEST_CANCEL:
      return 'PARENT_CLOSE_POLICY_REQUEST_CANCEL';
    default:
      return 'UNKNOWN';
  }
}

export enum ContinueAsNewInitiator {
  CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED = 0,
  CONTINUE_AS_NEW_INITIATOR_WORKFLOW = 1,
  CONTINUE_AS_NEW_INITIATOR_RETRY = 2,
  CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE = 3,
  UNRECOGNIZED = -1,
}

export function continueAsNewInitiatorFromJSON(
  object: any,
): ContinueAsNewInitiator {
  switch (object) {
    case 0:
    case 'CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED':
      return ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED;
    case 1:
    case 'CONTINUE_AS_NEW_INITIATOR_WORKFLOW':
      return ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_WORKFLOW;
    case 2:
    case 'CONTINUE_AS_NEW_INITIATOR_RETRY':
      return ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_RETRY;
    case 3:
    case 'CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE':
      return ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ContinueAsNewInitiator.UNRECOGNIZED;
  }
}

export function continueAsNewInitiatorToJSON(
  object: ContinueAsNewInitiator,
): string {
  switch (object) {
    case ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED:
      return 'CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED';
    case ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_WORKFLOW:
      return 'CONTINUE_AS_NEW_INITIATOR_WORKFLOW';
    case ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_RETRY:
      return 'CONTINUE_AS_NEW_INITIATOR_RETRY';
    case ContinueAsNewInitiator.CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE:
      return 'CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE';
    default:
      return 'UNKNOWN';
  }
}

/**
 * (-- api-linter: core::0216::synonyms=disabled
 *     aip.dev/not-precedent: There is WorkflowExecutionState already in another package. --)
 */
export enum WorkflowExecutionStatus {
  WORKFLOW_EXECUTION_STATUS_UNSPECIFIED = 0,
  /** WORKFLOW_EXECUTION_STATUS_RUNNING - Value 1 is hardcoded in SQL persistence. */
  WORKFLOW_EXECUTION_STATUS_RUNNING = 1,
  WORKFLOW_EXECUTION_STATUS_COMPLETED = 2,
  WORKFLOW_EXECUTION_STATUS_FAILED = 3,
  WORKFLOW_EXECUTION_STATUS_CANCELED = 4,
  WORKFLOW_EXECUTION_STATUS_TERMINATED = 5,
  WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW = 6,
  WORKFLOW_EXECUTION_STATUS_TIMED_OUT = 7,
  UNRECOGNIZED = -1,
}

export function workflowExecutionStatusFromJSON(
  object: any,
): WorkflowExecutionStatus {
  switch (object) {
    case 0:
    case 'WORKFLOW_EXECUTION_STATUS_UNSPECIFIED':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_UNSPECIFIED;
    case 1:
    case 'WORKFLOW_EXECUTION_STATUS_RUNNING':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING;
    case 2:
    case 'WORKFLOW_EXECUTION_STATUS_COMPLETED':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_COMPLETED;
    case 3:
    case 'WORKFLOW_EXECUTION_STATUS_FAILED':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_FAILED;
    case 4:
    case 'WORKFLOW_EXECUTION_STATUS_CANCELED':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_CANCELED;
    case 5:
    case 'WORKFLOW_EXECUTION_STATUS_TERMINATED':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_TERMINATED;
    case 6:
    case 'WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW;
    case 7:
    case 'WORKFLOW_EXECUTION_STATUS_TIMED_OUT':
      return WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_TIMED_OUT;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return WorkflowExecutionStatus.UNRECOGNIZED;
  }
}

export function workflowExecutionStatusToJSON(
  object: WorkflowExecutionStatus,
): string {
  switch (object) {
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_UNSPECIFIED:
      return 'WORKFLOW_EXECUTION_STATUS_UNSPECIFIED';
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING:
      return 'WORKFLOW_EXECUTION_STATUS_RUNNING';
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_COMPLETED:
      return 'WORKFLOW_EXECUTION_STATUS_COMPLETED';
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_FAILED:
      return 'WORKFLOW_EXECUTION_STATUS_FAILED';
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_CANCELED:
      return 'WORKFLOW_EXECUTION_STATUS_CANCELED';
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_TERMINATED:
      return 'WORKFLOW_EXECUTION_STATUS_TERMINATED';
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW:
      return 'WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW';
    case WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_TIMED_OUT:
      return 'WORKFLOW_EXECUTION_STATUS_TIMED_OUT';
    default:
      return 'UNKNOWN';
  }
}

export enum PendingActivityState {
  PENDING_ACTIVITY_STATE_UNSPECIFIED = 0,
  PENDING_ACTIVITY_STATE_SCHEDULED = 1,
  PENDING_ACTIVITY_STATE_STARTED = 2,
  PENDING_ACTIVITY_STATE_CANCEL_REQUESTED = 3,
  UNRECOGNIZED = -1,
}

export function pendingActivityStateFromJSON(
  object: any,
): PendingActivityState {
  switch (object) {
    case 0:
    case 'PENDING_ACTIVITY_STATE_UNSPECIFIED':
      return PendingActivityState.PENDING_ACTIVITY_STATE_UNSPECIFIED;
    case 1:
    case 'PENDING_ACTIVITY_STATE_SCHEDULED':
      return PendingActivityState.PENDING_ACTIVITY_STATE_SCHEDULED;
    case 2:
    case 'PENDING_ACTIVITY_STATE_STARTED':
      return PendingActivityState.PENDING_ACTIVITY_STATE_STARTED;
    case 3:
    case 'PENDING_ACTIVITY_STATE_CANCEL_REQUESTED':
      return PendingActivityState.PENDING_ACTIVITY_STATE_CANCEL_REQUESTED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return PendingActivityState.UNRECOGNIZED;
  }
}

export function pendingActivityStateToJSON(
  object: PendingActivityState,
): string {
  switch (object) {
    case PendingActivityState.PENDING_ACTIVITY_STATE_UNSPECIFIED:
      return 'PENDING_ACTIVITY_STATE_UNSPECIFIED';
    case PendingActivityState.PENDING_ACTIVITY_STATE_SCHEDULED:
      return 'PENDING_ACTIVITY_STATE_SCHEDULED';
    case PendingActivityState.PENDING_ACTIVITY_STATE_STARTED:
      return 'PENDING_ACTIVITY_STATE_STARTED';
    case PendingActivityState.PENDING_ACTIVITY_STATE_CANCEL_REQUESTED:
      return 'PENDING_ACTIVITY_STATE_CANCEL_REQUESTED';
    default:
      return 'UNKNOWN';
  }
}

export enum HistoryEventFilterType {
  HISTORY_EVENT_FILTER_TYPE_UNSPECIFIED = 0,
  HISTORY_EVENT_FILTER_TYPE_ALL_EVENT = 1,
  HISTORY_EVENT_FILTER_TYPE_CLOSE_EVENT = 2,
  UNRECOGNIZED = -1,
}

export function historyEventFilterTypeFromJSON(
  object: any,
): HistoryEventFilterType {
  switch (object) {
    case 0:
    case 'HISTORY_EVENT_FILTER_TYPE_UNSPECIFIED':
      return HistoryEventFilterType.HISTORY_EVENT_FILTER_TYPE_UNSPECIFIED;
    case 1:
    case 'HISTORY_EVENT_FILTER_TYPE_ALL_EVENT':
      return HistoryEventFilterType.HISTORY_EVENT_FILTER_TYPE_ALL_EVENT;
    case 2:
    case 'HISTORY_EVENT_FILTER_TYPE_CLOSE_EVENT':
      return HistoryEventFilterType.HISTORY_EVENT_FILTER_TYPE_CLOSE_EVENT;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return HistoryEventFilterType.UNRECOGNIZED;
  }
}

export function historyEventFilterTypeToJSON(
  object: HistoryEventFilterType,
): string {
  switch (object) {
    case HistoryEventFilterType.HISTORY_EVENT_FILTER_TYPE_UNSPECIFIED:
      return 'HISTORY_EVENT_FILTER_TYPE_UNSPECIFIED';
    case HistoryEventFilterType.HISTORY_EVENT_FILTER_TYPE_ALL_EVENT:
      return 'HISTORY_EVENT_FILTER_TYPE_ALL_EVENT';
    case HistoryEventFilterType.HISTORY_EVENT_FILTER_TYPE_CLOSE_EVENT:
      return 'HISTORY_EVENT_FILTER_TYPE_CLOSE_EVENT';
    default:
      return 'UNKNOWN';
  }
}

export enum RetryState {
  RETRY_STATE_UNSPECIFIED = 0,
  RETRY_STATE_IN_PROGRESS = 1,
  RETRY_STATE_NON_RETRYABLE_FAILURE = 2,
  RETRY_STATE_TIMEOUT = 3,
  RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED = 4,
  RETRY_STATE_RETRY_POLICY_NOT_SET = 5,
  RETRY_STATE_INTERNAL_SERVER_ERROR = 6,
  RETRY_STATE_CANCEL_REQUESTED = 7,
  UNRECOGNIZED = -1,
}

export function retryStateFromJSON(object: any): RetryState {
  switch (object) {
    case 0:
    case 'RETRY_STATE_UNSPECIFIED':
      return RetryState.RETRY_STATE_UNSPECIFIED;
    case 1:
    case 'RETRY_STATE_IN_PROGRESS':
      return RetryState.RETRY_STATE_IN_PROGRESS;
    case 2:
    case 'RETRY_STATE_NON_RETRYABLE_FAILURE':
      return RetryState.RETRY_STATE_NON_RETRYABLE_FAILURE;
    case 3:
    case 'RETRY_STATE_TIMEOUT':
      return RetryState.RETRY_STATE_TIMEOUT;
    case 4:
    case 'RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED':
      return RetryState.RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED;
    case 5:
    case 'RETRY_STATE_RETRY_POLICY_NOT_SET':
      return RetryState.RETRY_STATE_RETRY_POLICY_NOT_SET;
    case 6:
    case 'RETRY_STATE_INTERNAL_SERVER_ERROR':
      return RetryState.RETRY_STATE_INTERNAL_SERVER_ERROR;
    case 7:
    case 'RETRY_STATE_CANCEL_REQUESTED':
      return RetryState.RETRY_STATE_CANCEL_REQUESTED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RetryState.UNRECOGNIZED;
  }
}

export function retryStateToJSON(object: RetryState): string {
  switch (object) {
    case RetryState.RETRY_STATE_UNSPECIFIED:
      return 'RETRY_STATE_UNSPECIFIED';
    case RetryState.RETRY_STATE_IN_PROGRESS:
      return 'RETRY_STATE_IN_PROGRESS';
    case RetryState.RETRY_STATE_NON_RETRYABLE_FAILURE:
      return 'RETRY_STATE_NON_RETRYABLE_FAILURE';
    case RetryState.RETRY_STATE_TIMEOUT:
      return 'RETRY_STATE_TIMEOUT';
    case RetryState.RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED:
      return 'RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED';
    case RetryState.RETRY_STATE_RETRY_POLICY_NOT_SET:
      return 'RETRY_STATE_RETRY_POLICY_NOT_SET';
    case RetryState.RETRY_STATE_INTERNAL_SERVER_ERROR:
      return 'RETRY_STATE_INTERNAL_SERVER_ERROR';
    case RetryState.RETRY_STATE_CANCEL_REQUESTED:
      return 'RETRY_STATE_CANCEL_REQUESTED';
    default:
      return 'UNKNOWN';
  }
}

export enum TimeoutType {
  TIMEOUT_TYPE_UNSPECIFIED = 0,
  TIMEOUT_TYPE_START_TO_CLOSE = 1,
  TIMEOUT_TYPE_SCHEDULE_TO_START = 2,
  TIMEOUT_TYPE_SCHEDULE_TO_CLOSE = 3,
  TIMEOUT_TYPE_HEARTBEAT = 4,
  UNRECOGNIZED = -1,
}

export function timeoutTypeFromJSON(object: any): TimeoutType {
  switch (object) {
    case 0:
    case 'TIMEOUT_TYPE_UNSPECIFIED':
      return TimeoutType.TIMEOUT_TYPE_UNSPECIFIED;
    case 1:
    case 'TIMEOUT_TYPE_START_TO_CLOSE':
      return TimeoutType.TIMEOUT_TYPE_START_TO_CLOSE;
    case 2:
    case 'TIMEOUT_TYPE_SCHEDULE_TO_START':
      return TimeoutType.TIMEOUT_TYPE_SCHEDULE_TO_START;
    case 3:
    case 'TIMEOUT_TYPE_SCHEDULE_TO_CLOSE':
      return TimeoutType.TIMEOUT_TYPE_SCHEDULE_TO_CLOSE;
    case 4:
    case 'TIMEOUT_TYPE_HEARTBEAT':
      return TimeoutType.TIMEOUT_TYPE_HEARTBEAT;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return TimeoutType.UNRECOGNIZED;
  }
}

export function timeoutTypeToJSON(object: TimeoutType): string {
  switch (object) {
    case TimeoutType.TIMEOUT_TYPE_UNSPECIFIED:
      return 'TIMEOUT_TYPE_UNSPECIFIED';
    case TimeoutType.TIMEOUT_TYPE_START_TO_CLOSE:
      return 'TIMEOUT_TYPE_START_TO_CLOSE';
    case TimeoutType.TIMEOUT_TYPE_SCHEDULE_TO_START:
      return 'TIMEOUT_TYPE_SCHEDULE_TO_START';
    case TimeoutType.TIMEOUT_TYPE_SCHEDULE_TO_CLOSE:
      return 'TIMEOUT_TYPE_SCHEDULE_TO_CLOSE';
    case TimeoutType.TIMEOUT_TYPE_HEARTBEAT:
      return 'TIMEOUT_TYPE_HEARTBEAT';
    default:
      return 'UNKNOWN';
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
