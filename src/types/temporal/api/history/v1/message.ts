/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  ContinueAsNewInitiator,
  RetryState,
  TimeoutType,
  ParentClosePolicy,
  WorkflowIdReusePolicy,
  continueAsNewInitiatorFromJSON,
  continueAsNewInitiatorToJSON,
  retryStateFromJSON,
  retryStateToJSON,
  timeoutTypeFromJSON,
  timeoutTypeToJSON,
  parentClosePolicyFromJSON,
  workflowIdReusePolicyFromJSON,
  parentClosePolicyToJSON,
  workflowIdReusePolicyToJSON,
} from '../../../../temporal/api/enums/v1/workflow';
import {
  WorkflowTaskFailedCause,
  CancelExternalWorkflowExecutionFailedCause,
  SignalExternalWorkflowExecutionFailedCause,
  StartChildWorkflowExecutionFailedCause,
  workflowTaskFailedCauseFromJSON,
  workflowTaskFailedCauseToJSON,
  cancelExternalWorkflowExecutionFailedCauseFromJSON,
  cancelExternalWorkflowExecutionFailedCauseToJSON,
  signalExternalWorkflowExecutionFailedCauseFromJSON,
  signalExternalWorkflowExecutionFailedCauseToJSON,
  startChildWorkflowExecutionFailedCauseFromJSON,
  startChildWorkflowExecutionFailedCauseToJSON,
} from '../../../../temporal/api/enums/v1/failed_cause';
import {
  EventType,
  eventTypeFromJSON,
  eventTypeToJSON,
} from '../../../../temporal/api/enums/v1/event_type';
import { Timestamp } from '../../../../google/protobuf/timestamp';
import {
  WorkflowType,
  WorkflowExecution,
  Payloads,
  RetryPolicy,
  Memo,
  SearchAttributes,
  Header,
  ActivityType,
} from '../../../../temporal/api/common/v1/message';
import { TaskQueue } from '../../../../temporal/api/taskqueue/v1/message';
import { Duration } from '../../../../google/protobuf/duration';
import { Failure } from '../../../../temporal/api/failure/v1/message';
import { ResetPoints } from '../../../../temporal/api/workflow/v1/message';

export const protobufPackage = 'temporal.api.history.v1';

export interface WorkflowExecutionStartedEventAttributes {
  workflowType: WorkflowType | undefined;
  parentWorkflowNamespace: string;
  parentWorkflowExecution: WorkflowExecution | undefined;
  parentInitiatedEventId: number;
  taskQueue: TaskQueue | undefined;
  input: Payloads | undefined;
  /** Total workflow execution timeout including retries and continue as new. */
  workflowExecutionTimeout: Duration | undefined;
  /** Timeout of a single workflow run. */
  workflowRunTimeout: Duration | undefined;
  /** Timeout of a single workflow task. */
  workflowTaskTimeout: Duration | undefined;
  continuedExecutionRunId: string;
  initiator: ContinueAsNewInitiator;
  continuedFailure: Failure | undefined;
  lastCompletionResult: Payloads | undefined;
  /** This is the runId when the WorkflowExecutionStarted event is written. */
  originalExecutionRunId: string;
  identity: string;
  /** This is the very first runId along the chain of ContinueAsNew and Reset. */
  firstExecutionRunId: string;
  retryPolicy: RetryPolicy | undefined;
  attempt: number;
  /**
   * The absolute time at which workflow is timed out.
   * This time is passed without change to the next run/retry of a workflow.
   */
  workflowExecutionExpirationTime: Date | undefined;
  cronSchedule: string;
  firstWorkflowTaskBackoff: Duration | undefined;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
  prevAutoResetPoints: ResetPoints | undefined;
  header: Header | undefined;
}

export interface WorkflowExecutionCompletedEventAttributes {
  result: Payloads | undefined;
  workflowTaskCompletedEventId: number;
}

export interface WorkflowExecutionFailedEventAttributes {
  failure: Failure | undefined;
  retryState: RetryState;
  workflowTaskCompletedEventId: number;
}

export interface WorkflowExecutionTimedOutEventAttributes {
  retryState: RetryState;
}

export interface WorkflowExecutionContinuedAsNewEventAttributes {
  newExecutionRunId: string;
  workflowType: WorkflowType | undefined;
  taskQueue: TaskQueue | undefined;
  input: Payloads | undefined;
  /**
   * workflow_execution_timeout is omitted as it shouldn'be overridden from within a workflow.
   * Timeout of a single workflow run.
   */
  workflowRunTimeout: Duration | undefined;
  /** Timeout of a single workflow task. */
  workflowTaskTimeout: Duration | undefined;
  workflowTaskCompletedEventId: number;
  backoffStartInterval: Duration | undefined;
  initiator: ContinueAsNewInitiator;
  failure: Failure | undefined;
  lastCompletionResult: Payloads | undefined;
  header: Header | undefined;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
}

export interface WorkflowTaskScheduledEventAttributes {
  taskQueue: TaskQueue | undefined;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  startToCloseTimeout: Duration | undefined;
  attempt: number;
}

export interface WorkflowTaskStartedEventAttributes {
  scheduledEventId: number;
  identity: string;
  requestId: string;
}

export interface WorkflowTaskCompletedEventAttributes {
  scheduledEventId: number;
  startedEventId: number;
  identity: string;
  binaryChecksum: string;
}

export interface WorkflowTaskTimedOutEventAttributes {
  scheduledEventId: number;
  startedEventId: number;
  timeoutType: TimeoutType;
}

export interface WorkflowTaskFailedEventAttributes {
  scheduledEventId: number;
  startedEventId: number;
  cause: WorkflowTaskFailedCause;
  failure: Failure | undefined;
  identity: string;
  /** For reset workflow. */
  baseRunId: string;
  newRunId: string;
  forkEventVersion: number;
  binaryChecksum: string;
}

export interface ActivityTaskScheduledEventAttributes {
  activityId: string;
  activityType: ActivityType | undefined;
  namespace: string;
  taskQueue: TaskQueue | undefined;
  header: Header | undefined;
  input: Payloads | undefined;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   * Indicates how long the caller is willing to wait for an activity completion.
   * Limits for how long retries are happening. Either this or start_to_close_timeout_seconds must be specified.
   */
  scheduleToCloseTimeout: Duration | undefined;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   * Limits time an activity task can stay in a task queue before a worker picks it up.
   * This timeout is always non retryable as all a retry would achieve is to put it back into the same queue.
   * Defaults to schedule_to_close_timeout_seconds or workflow execution timeout if not specified.
   */
  scheduleToStartTimeout: Duration | undefined;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   * Maximum time an activity is allowed to execute after a pick up by a worker.
   * This timeout is always retryable. Either this or schedule_to_close_timeout_seconds must be specified.
   */
  startToCloseTimeout: Duration | undefined;
  /** Maximum time between successful worker heartbeats. */
  heartbeatTimeout: Duration | undefined;
  workflowTaskCompletedEventId: number;
  /**
   * Activities are provided by a default retry policy controlled through the service dynamic configuration.
   * Retries are happening up to schedule_to_close_timeout.
   * To disable retries set retry_policy.maximum_attempts to 1.
   */
  retryPolicy: RetryPolicy | undefined;
}

export interface ActivityTaskStartedEventAttributes {
  scheduledEventId: number;
  identity: string;
  requestId: string;
  attempt: number;
  lastFailure: Failure | undefined;
}

export interface ActivityTaskCompletedEventAttributes {
  result: Payloads | undefined;
  scheduledEventId: number;
  startedEventId: number;
  identity: string;
}

export interface ActivityTaskFailedEventAttributes {
  failure: Failure | undefined;
  scheduledEventId: number;
  startedEventId: number;
  identity: string;
  retryState: RetryState;
}

export interface ActivityTaskTimedOutEventAttributes {
  /** For retry activity, it may have a failure before timeout. It is stored as `cause` in `failure`. */
  failure: Failure | undefined;
  scheduledEventId: number;
  startedEventId: number;
  retryState: RetryState;
}

export interface ActivityTaskCancelRequestedEventAttributes {
  scheduledEventId: number;
  workflowTaskCompletedEventId: number;
}

export interface ActivityTaskCanceledEventAttributes {
  details: Payloads | undefined;
  latestCancelRequestedEventId: number;
  scheduledEventId: number;
  startedEventId: number;
  identity: string;
}

export interface TimerStartedEventAttributes {
  timerId: string;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  startToFireTimeout: Duration | undefined;
  workflowTaskCompletedEventId: number;
}

export interface TimerFiredEventAttributes {
  timerId: string;
  startedEventId: number;
}

export interface TimerCanceledEventAttributes {
  timerId: string;
  startedEventId: number;
  workflowTaskCompletedEventId: number;
  identity: string;
}

export interface WorkflowExecutionCancelRequestedEventAttributes {
  cause: string;
  externalInitiatedEventId: number;
  externalWorkflowExecution: WorkflowExecution | undefined;
  identity: string;
}

export interface WorkflowExecutionCanceledEventAttributes {
  workflowTaskCompletedEventId: number;
  details: Payloads | undefined;
}

export interface MarkerRecordedEventAttributes {
  markerName: string;
  details: { [key: string]: Payloads };
  workflowTaskCompletedEventId: number;
  header: Header | undefined;
  failure: Failure | undefined;
}

export interface MarkerRecordedEventAttributes_DetailsEntry {
  key: string;
  value: Payloads | undefined;
}

export interface WorkflowExecutionSignaledEventAttributes {
  signalName: string;
  input: Payloads | undefined;
  identity: string;
}

export interface WorkflowExecutionTerminatedEventAttributes {
  reason: string;
  details: Payloads | undefined;
  identity: string;
}

export interface RequestCancelExternalWorkflowExecutionInitiatedEventAttributes {
  workflowTaskCompletedEventId: number;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  control: string;
  childWorkflowOnly: boolean;
}

export interface RequestCancelExternalWorkflowExecutionFailedEventAttributes {
  cause: CancelExternalWorkflowExecutionFailedCause;
  workflowTaskCompletedEventId: number;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  initiatedEventId: number;
  control: string;
}

export interface ExternalWorkflowExecutionCancelRequestedEventAttributes {
  initiatedEventId: number;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
}

export interface SignalExternalWorkflowExecutionInitiatedEventAttributes {
  workflowTaskCompletedEventId: number;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  signalName: string;
  input: Payloads | undefined;
  control: string;
  childWorkflowOnly: boolean;
}

export interface SignalExternalWorkflowExecutionFailedEventAttributes {
  cause: SignalExternalWorkflowExecutionFailedCause;
  workflowTaskCompletedEventId: number;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  initiatedEventId: number;
  control: string;
}

export interface ExternalWorkflowExecutionSignaledEventAttributes {
  initiatedEventId: number;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  control: string;
}

export interface UpsertWorkflowSearchAttributesEventAttributes {
  workflowTaskCompletedEventId: number;
  searchAttributes: SearchAttributes | undefined;
}

export interface StartChildWorkflowExecutionInitiatedEventAttributes {
  namespace: string;
  workflowId: string;
  workflowType: WorkflowType | undefined;
  taskQueue: TaskQueue | undefined;
  input: Payloads | undefined;
  /** Total workflow execution timeout including retries and continue as new. */
  workflowExecutionTimeout: Duration | undefined;
  /** Timeout of a single workflow run. */
  workflowRunTimeout: Duration | undefined;
  /** Timeout of a single workflow task. */
  workflowTaskTimeout: Duration | undefined;
  /** Default: PARENT_CLOSE_POLICY_TERMINATE. */
  parentClosePolicy: ParentClosePolicy;
  control: string;
  workflowTaskCompletedEventId: number;
  /** Default: WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE. */
  workflowIdReusePolicy: WorkflowIdReusePolicy;
  retryPolicy: RetryPolicy | undefined;
  cronSchedule: string;
  header: Header | undefined;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
}

export interface StartChildWorkflowExecutionFailedEventAttributes {
  namespace: string;
  workflowId: string;
  workflowType: WorkflowType | undefined;
  cause: StartChildWorkflowExecutionFailedCause;
  control: string;
  initiatedEventId: number;
  workflowTaskCompletedEventId: number;
}

export interface ChildWorkflowExecutionStartedEventAttributes {
  namespace: string;
  initiatedEventId: number;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  header: Header | undefined;
}

export interface ChildWorkflowExecutionCompletedEventAttributes {
  result: Payloads | undefined;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  initiatedEventId: number;
  startedEventId: number;
}

export interface ChildWorkflowExecutionFailedEventAttributes {
  failure: Failure | undefined;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  initiatedEventId: number;
  startedEventId: number;
  retryState: RetryState;
}

export interface ChildWorkflowExecutionCanceledEventAttributes {
  details: Payloads | undefined;
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  initiatedEventId: number;
  startedEventId: number;
}

export interface ChildWorkflowExecutionTimedOutEventAttributes {
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  initiatedEventId: number;
  startedEventId: number;
  retryState: RetryState;
}

export interface ChildWorkflowExecutionTerminatedEventAttributes {
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  initiatedEventId: number;
  startedEventId: number;
}

export interface HistoryEvent {
  eventId: number;
  eventTime: Date | undefined;
  eventType: EventType;
  version: number;
  taskId: number;
  workflowExecutionStartedEventAttributes:
    | WorkflowExecutionStartedEventAttributes
    | undefined;
  workflowExecutionCompletedEventAttributes:
    | WorkflowExecutionCompletedEventAttributes
    | undefined;
  workflowExecutionFailedEventAttributes:
    | WorkflowExecutionFailedEventAttributes
    | undefined;
  workflowExecutionTimedOutEventAttributes:
    | WorkflowExecutionTimedOutEventAttributes
    | undefined;
  workflowTaskScheduledEventAttributes:
    | WorkflowTaskScheduledEventAttributes
    | undefined;
  workflowTaskStartedEventAttributes:
    | WorkflowTaskStartedEventAttributes
    | undefined;
  workflowTaskCompletedEventAttributes:
    | WorkflowTaskCompletedEventAttributes
    | undefined;
  workflowTaskTimedOutEventAttributes:
    | WorkflowTaskTimedOutEventAttributes
    | undefined;
  workflowTaskFailedEventAttributes:
    | WorkflowTaskFailedEventAttributes
    | undefined;
  activityTaskScheduledEventAttributes:
    | ActivityTaskScheduledEventAttributes
    | undefined;
  activityTaskStartedEventAttributes:
    | ActivityTaskStartedEventAttributes
    | undefined;
  activityTaskCompletedEventAttributes:
    | ActivityTaskCompletedEventAttributes
    | undefined;
  activityTaskFailedEventAttributes:
    | ActivityTaskFailedEventAttributes
    | undefined;
  activityTaskTimedOutEventAttributes:
    | ActivityTaskTimedOutEventAttributes
    | undefined;
  timerStartedEventAttributes: TimerStartedEventAttributes | undefined;
  timerFiredEventAttributes: TimerFiredEventAttributes | undefined;
  activityTaskCancelRequestedEventAttributes:
    | ActivityTaskCancelRequestedEventAttributes
    | undefined;
  activityTaskCanceledEventAttributes:
    | ActivityTaskCanceledEventAttributes
    | undefined;
  timerCanceledEventAttributes: TimerCanceledEventAttributes | undefined;
  markerRecordedEventAttributes: MarkerRecordedEventAttributes | undefined;
  workflowExecutionSignaledEventAttributes:
    | WorkflowExecutionSignaledEventAttributes
    | undefined;
  workflowExecutionTerminatedEventAttributes:
    | WorkflowExecutionTerminatedEventAttributes
    | undefined;
  workflowExecutionCancelRequestedEventAttributes:
    | WorkflowExecutionCancelRequestedEventAttributes
    | undefined;
  workflowExecutionCanceledEventAttributes:
    | WorkflowExecutionCanceledEventAttributes
    | undefined;
  requestCancelExternalWorkflowExecutionInitiatedEventAttributes:
    | RequestCancelExternalWorkflowExecutionInitiatedEventAttributes
    | undefined;
  requestCancelExternalWorkflowExecutionFailedEventAttributes:
    | RequestCancelExternalWorkflowExecutionFailedEventAttributes
    | undefined;
  externalWorkflowExecutionCancelRequestedEventAttributes:
    | ExternalWorkflowExecutionCancelRequestedEventAttributes
    | undefined;
  workflowExecutionContinuedAsNewEventAttributes:
    | WorkflowExecutionContinuedAsNewEventAttributes
    | undefined;
  startChildWorkflowExecutionInitiatedEventAttributes:
    | StartChildWorkflowExecutionInitiatedEventAttributes
    | undefined;
  startChildWorkflowExecutionFailedEventAttributes:
    | StartChildWorkflowExecutionFailedEventAttributes
    | undefined;
  childWorkflowExecutionStartedEventAttributes:
    | ChildWorkflowExecutionStartedEventAttributes
    | undefined;
  childWorkflowExecutionCompletedEventAttributes:
    | ChildWorkflowExecutionCompletedEventAttributes
    | undefined;
  childWorkflowExecutionFailedEventAttributes:
    | ChildWorkflowExecutionFailedEventAttributes
    | undefined;
  childWorkflowExecutionCanceledEventAttributes:
    | ChildWorkflowExecutionCanceledEventAttributes
    | undefined;
  childWorkflowExecutionTimedOutEventAttributes:
    | ChildWorkflowExecutionTimedOutEventAttributes
    | undefined;
  childWorkflowExecutionTerminatedEventAttributes:
    | ChildWorkflowExecutionTerminatedEventAttributes
    | undefined;
  signalExternalWorkflowExecutionInitiatedEventAttributes:
    | SignalExternalWorkflowExecutionInitiatedEventAttributes
    | undefined;
  signalExternalWorkflowExecutionFailedEventAttributes:
    | SignalExternalWorkflowExecutionFailedEventAttributes
    | undefined;
  externalWorkflowExecutionSignaledEventAttributes:
    | ExternalWorkflowExecutionSignaledEventAttributes
    | undefined;
  upsertWorkflowSearchAttributesEventAttributes:
    | UpsertWorkflowSearchAttributesEventAttributes
    | undefined;
}

export interface History {
  events: HistoryEvent[];
}

const baseWorkflowExecutionStartedEventAttributes: object = {
  parentWorkflowNamespace: '',
  parentInitiatedEventId: 0,
  continuedExecutionRunId: '',
  initiator: 0,
  originalExecutionRunId: '',
  identity: '',
  firstExecutionRunId: '',
  attempt: 0,
  cronSchedule: '',
};

export const WorkflowExecutionStartedEventAttributes = {
  encode(
    message: WorkflowExecutionStartedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.parentWorkflowNamespace !== '') {
      writer.uint32(18).string(message.parentWorkflowNamespace);
    }
    if (message.parentWorkflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.parentWorkflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.parentInitiatedEventId !== 0) {
      writer.uint32(32).int64(message.parentInitiatedEventId);
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(42).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(50).fork()).ldelim();
    }
    if (message.workflowExecutionTimeout !== undefined) {
      Duration.encode(
        message.workflowExecutionTimeout,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.workflowRunTimeout !== undefined) {
      Duration.encode(
        message.workflowRunTimeout,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.workflowTaskTimeout !== undefined) {
      Duration.encode(
        message.workflowTaskTimeout,
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.continuedExecutionRunId !== '') {
      writer.uint32(82).string(message.continuedExecutionRunId);
    }
    if (message.initiator !== 0) {
      writer.uint32(88).int32(message.initiator);
    }
    if (message.continuedFailure !== undefined) {
      Failure.encode(
        message.continuedFailure,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.lastCompletionResult !== undefined) {
      Payloads.encode(
        message.lastCompletionResult,
        writer.uint32(106).fork(),
      ).ldelim();
    }
    if (message.originalExecutionRunId !== '') {
      writer.uint32(114).string(message.originalExecutionRunId);
    }
    if (message.identity !== '') {
      writer.uint32(122).string(message.identity);
    }
    if (message.firstExecutionRunId !== '') {
      writer.uint32(130).string(message.firstExecutionRunId);
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(138).fork(),
      ).ldelim();
    }
    if (message.attempt !== 0) {
      writer.uint32(144).int32(message.attempt);
    }
    if (message.workflowExecutionExpirationTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.workflowExecutionExpirationTime),
        writer.uint32(154).fork(),
      ).ldelim();
    }
    if (message.cronSchedule !== '') {
      writer.uint32(162).string(message.cronSchedule);
    }
    if (message.firstWorkflowTaskBackoff !== undefined) {
      Duration.encode(
        message.firstWorkflowTaskBackoff,
        writer.uint32(170).fork(),
      ).ldelim();
    }
    if (message.memo !== undefined) {
      Memo.encode(message.memo, writer.uint32(178).fork()).ldelim();
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(186).fork(),
      ).ldelim();
    }
    if (message.prevAutoResetPoints !== undefined) {
      ResetPoints.encode(
        message.prevAutoResetPoints,
        writer.uint32(194).fork(),
      ).ldelim();
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(202).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionStartedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionStartedEventAttributes,
    } as WorkflowExecutionStartedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 2:
          message.parentWorkflowNamespace = reader.string();
          break;
        case 3:
          message.parentWorkflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.parentInitiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 6:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 7:
          message.workflowExecutionTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 8:
          message.workflowRunTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 9:
          message.workflowTaskTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 10:
          message.continuedExecutionRunId = reader.string();
          break;
        case 11:
          message.initiator = reader.int32() as any;
          break;
        case 12:
          message.continuedFailure = Failure.decode(reader, reader.uint32());
          break;
        case 13:
          message.lastCompletionResult = Payloads.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 14:
          message.originalExecutionRunId = reader.string();
          break;
        case 15:
          message.identity = reader.string();
          break;
        case 16:
          message.firstExecutionRunId = reader.string();
          break;
        case 17:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        case 18:
          message.attempt = reader.int32();
          break;
        case 19:
          message.workflowExecutionExpirationTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 20:
          message.cronSchedule = reader.string();
          break;
        case 21:
          message.firstWorkflowTaskBackoff = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 22:
          message.memo = Memo.decode(reader, reader.uint32());
          break;
        case 23:
          message.searchAttributes = SearchAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 24:
          message.prevAutoResetPoints = ResetPoints.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 25:
          message.header = Header.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionStartedEventAttributes {
    const message = {
      ...baseWorkflowExecutionStartedEventAttributes,
    } as WorkflowExecutionStartedEventAttributes;
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.parentWorkflowNamespace !== undefined &&
      object.parentWorkflowNamespace !== null
    ) {
      message.parentWorkflowNamespace = String(object.parentWorkflowNamespace);
    } else {
      message.parentWorkflowNamespace = '';
    }
    if (
      object.parentWorkflowExecution !== undefined &&
      object.parentWorkflowExecution !== null
    ) {
      message.parentWorkflowExecution = WorkflowExecution.fromJSON(
        object.parentWorkflowExecution,
      );
    } else {
      message.parentWorkflowExecution = undefined;
    }
    if (
      object.parentInitiatedEventId !== undefined &&
      object.parentInitiatedEventId !== null
    ) {
      message.parentInitiatedEventId = Number(object.parentInitiatedEventId);
    } else {
      message.parentInitiatedEventId = 0;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromJSON(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromJSON(object.workflowRunTimeout);
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromJSON(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (
      object.continuedExecutionRunId !== undefined &&
      object.continuedExecutionRunId !== null
    ) {
      message.continuedExecutionRunId = String(object.continuedExecutionRunId);
    } else {
      message.continuedExecutionRunId = '';
    }
    if (object.initiator !== undefined && object.initiator !== null) {
      message.initiator = continueAsNewInitiatorFromJSON(object.initiator);
    } else {
      message.initiator = 0;
    }
    if (
      object.continuedFailure !== undefined &&
      object.continuedFailure !== null
    ) {
      message.continuedFailure = Failure.fromJSON(object.continuedFailure);
    } else {
      message.continuedFailure = undefined;
    }
    if (
      object.lastCompletionResult !== undefined &&
      object.lastCompletionResult !== null
    ) {
      message.lastCompletionResult = Payloads.fromJSON(
        object.lastCompletionResult,
      );
    } else {
      message.lastCompletionResult = undefined;
    }
    if (
      object.originalExecutionRunId !== undefined &&
      object.originalExecutionRunId !== null
    ) {
      message.originalExecutionRunId = String(object.originalExecutionRunId);
    } else {
      message.originalExecutionRunId = '';
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (
      object.firstExecutionRunId !== undefined &&
      object.firstExecutionRunId !== null
    ) {
      message.firstExecutionRunId = String(object.firstExecutionRunId);
    } else {
      message.firstExecutionRunId = '';
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = Number(object.attempt);
    } else {
      message.attempt = 0;
    }
    if (
      object.workflowExecutionExpirationTime !== undefined &&
      object.workflowExecutionExpirationTime !== null
    ) {
      message.workflowExecutionExpirationTime = fromJsonTimestamp(
        object.workflowExecutionExpirationTime,
      );
    } else {
      message.workflowExecutionExpirationTime = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = String(object.cronSchedule);
    } else {
      message.cronSchedule = '';
    }
    if (
      object.firstWorkflowTaskBackoff !== undefined &&
      object.firstWorkflowTaskBackoff !== null
    ) {
      message.firstWorkflowTaskBackoff = Duration.fromJSON(
        object.firstWorkflowTaskBackoff,
      );
    } else {
      message.firstWorkflowTaskBackoff = undefined;
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromJSON(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromJSON(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    if (
      object.prevAutoResetPoints !== undefined &&
      object.prevAutoResetPoints !== null
    ) {
      message.prevAutoResetPoints = ResetPoints.fromJSON(
        object.prevAutoResetPoints,
      );
    } else {
      message.prevAutoResetPoints = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionStartedEventAttributes): unknown {
    const obj: any = {};
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.parentWorkflowNamespace !== undefined &&
      (obj.parentWorkflowNamespace = message.parentWorkflowNamespace);
    message.parentWorkflowExecution !== undefined &&
      (obj.parentWorkflowExecution = message.parentWorkflowExecution
        ? WorkflowExecution.toJSON(message.parentWorkflowExecution)
        : undefined);
    message.parentInitiatedEventId !== undefined &&
      (obj.parentInitiatedEventId = message.parentInitiatedEventId);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.workflowExecutionTimeout !== undefined &&
      (obj.workflowExecutionTimeout = message.workflowExecutionTimeout
        ? Duration.toJSON(message.workflowExecutionTimeout)
        : undefined);
    message.workflowRunTimeout !== undefined &&
      (obj.workflowRunTimeout = message.workflowRunTimeout
        ? Duration.toJSON(message.workflowRunTimeout)
        : undefined);
    message.workflowTaskTimeout !== undefined &&
      (obj.workflowTaskTimeout = message.workflowTaskTimeout
        ? Duration.toJSON(message.workflowTaskTimeout)
        : undefined);
    message.continuedExecutionRunId !== undefined &&
      (obj.continuedExecutionRunId = message.continuedExecutionRunId);
    message.initiator !== undefined &&
      (obj.initiator = continueAsNewInitiatorToJSON(message.initiator));
    message.continuedFailure !== undefined &&
      (obj.continuedFailure = message.continuedFailure
        ? Failure.toJSON(message.continuedFailure)
        : undefined);
    message.lastCompletionResult !== undefined &&
      (obj.lastCompletionResult = message.lastCompletionResult
        ? Payloads.toJSON(message.lastCompletionResult)
        : undefined);
    message.originalExecutionRunId !== undefined &&
      (obj.originalExecutionRunId = message.originalExecutionRunId);
    message.identity !== undefined && (obj.identity = message.identity);
    message.firstExecutionRunId !== undefined &&
      (obj.firstExecutionRunId = message.firstExecutionRunId);
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
        : undefined);
    message.attempt !== undefined && (obj.attempt = message.attempt);
    message.workflowExecutionExpirationTime !== undefined &&
      (obj.workflowExecutionExpirationTime = message.workflowExecutionExpirationTime.toISOString());
    message.cronSchedule !== undefined &&
      (obj.cronSchedule = message.cronSchedule);
    message.firstWorkflowTaskBackoff !== undefined &&
      (obj.firstWorkflowTaskBackoff = message.firstWorkflowTaskBackoff
        ? Duration.toJSON(message.firstWorkflowTaskBackoff)
        : undefined);
    message.memo !== undefined &&
      (obj.memo = message.memo ? Memo.toJSON(message.memo) : undefined);
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    message.prevAutoResetPoints !== undefined &&
      (obj.prevAutoResetPoints = message.prevAutoResetPoints
        ? ResetPoints.toJSON(message.prevAutoResetPoints)
        : undefined);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionStartedEventAttributes>,
  ): WorkflowExecutionStartedEventAttributes {
    const message = {
      ...baseWorkflowExecutionStartedEventAttributes,
    } as WorkflowExecutionStartedEventAttributes;
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.parentWorkflowNamespace !== undefined &&
      object.parentWorkflowNamespace !== null
    ) {
      message.parentWorkflowNamespace = object.parentWorkflowNamespace;
    } else {
      message.parentWorkflowNamespace = '';
    }
    if (
      object.parentWorkflowExecution !== undefined &&
      object.parentWorkflowExecution !== null
    ) {
      message.parentWorkflowExecution = WorkflowExecution.fromPartial(
        object.parentWorkflowExecution,
      );
    } else {
      message.parentWorkflowExecution = undefined;
    }
    if (
      object.parentInitiatedEventId !== undefined &&
      object.parentInitiatedEventId !== null
    ) {
      message.parentInitiatedEventId = object.parentInitiatedEventId;
    } else {
      message.parentInitiatedEventId = 0;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromPartial(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromPartial(
        object.workflowRunTimeout,
      );
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromPartial(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (
      object.continuedExecutionRunId !== undefined &&
      object.continuedExecutionRunId !== null
    ) {
      message.continuedExecutionRunId = object.continuedExecutionRunId;
    } else {
      message.continuedExecutionRunId = '';
    }
    if (object.initiator !== undefined && object.initiator !== null) {
      message.initiator = object.initiator;
    } else {
      message.initiator = 0;
    }
    if (
      object.continuedFailure !== undefined &&
      object.continuedFailure !== null
    ) {
      message.continuedFailure = Failure.fromPartial(object.continuedFailure);
    } else {
      message.continuedFailure = undefined;
    }
    if (
      object.lastCompletionResult !== undefined &&
      object.lastCompletionResult !== null
    ) {
      message.lastCompletionResult = Payloads.fromPartial(
        object.lastCompletionResult,
      );
    } else {
      message.lastCompletionResult = undefined;
    }
    if (
      object.originalExecutionRunId !== undefined &&
      object.originalExecutionRunId !== null
    ) {
      message.originalExecutionRunId = object.originalExecutionRunId;
    } else {
      message.originalExecutionRunId = '';
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (
      object.firstExecutionRunId !== undefined &&
      object.firstExecutionRunId !== null
    ) {
      message.firstExecutionRunId = object.firstExecutionRunId;
    } else {
      message.firstExecutionRunId = '';
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = object.attempt;
    } else {
      message.attempt = 0;
    }
    if (
      object.workflowExecutionExpirationTime !== undefined &&
      object.workflowExecutionExpirationTime !== null
    ) {
      message.workflowExecutionExpirationTime =
        object.workflowExecutionExpirationTime;
    } else {
      message.workflowExecutionExpirationTime = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = object.cronSchedule;
    } else {
      message.cronSchedule = '';
    }
    if (
      object.firstWorkflowTaskBackoff !== undefined &&
      object.firstWorkflowTaskBackoff !== null
    ) {
      message.firstWorkflowTaskBackoff = Duration.fromPartial(
        object.firstWorkflowTaskBackoff,
      );
    } else {
      message.firstWorkflowTaskBackoff = undefined;
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromPartial(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromPartial(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    if (
      object.prevAutoResetPoints !== undefined &&
      object.prevAutoResetPoints !== null
    ) {
      message.prevAutoResetPoints = ResetPoints.fromPartial(
        object.prevAutoResetPoints,
      );
    } else {
      message.prevAutoResetPoints = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },
};

const baseWorkflowExecutionCompletedEventAttributes: object = {
  workflowTaskCompletedEventId: 0,
};

export const WorkflowExecutionCompletedEventAttributes = {
  encode(
    message: WorkflowExecutionCompletedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.result !== undefined) {
      Payloads.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(16).int64(message.workflowTaskCompletedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionCompletedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionCompletedEventAttributes,
    } as WorkflowExecutionCompletedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.result = Payloads.decode(reader, reader.uint32());
          break;
        case 2:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionCompletedEventAttributes {
    const message = {
      ...baseWorkflowExecutionCompletedEventAttributes,
    } as WorkflowExecutionCompletedEventAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromJSON(object.result);
    } else {
      message.result = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionCompletedEventAttributes): unknown {
    const obj: any = {};
    message.result !== undefined &&
      (obj.result = message.result
        ? Payloads.toJSON(message.result)
        : undefined);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionCompletedEventAttributes>,
  ): WorkflowExecutionCompletedEventAttributes {
    const message = {
      ...baseWorkflowExecutionCompletedEventAttributes,
    } as WorkflowExecutionCompletedEventAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromPartial(object.result);
    } else {
      message.result = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },
};

const baseWorkflowExecutionFailedEventAttributes: object = {
  retryState: 0,
  workflowTaskCompletedEventId: 0,
};

export const WorkflowExecutionFailedEventAttributes = {
  encode(
    message: WorkflowExecutionFailedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(10).fork()).ldelim();
    }
    if (message.retryState !== 0) {
      writer.uint32(16).int32(message.retryState);
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(24).int64(message.workflowTaskCompletedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionFailedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionFailedEventAttributes,
    } as WorkflowExecutionFailedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 2:
          message.retryState = reader.int32() as any;
          break;
        case 3:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseWorkflowExecutionFailedEventAttributes,
    } as WorkflowExecutionFailedEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = retryStateFromJSON(object.retryState);
    } else {
      message.retryState = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionFailedEventAttributes): unknown {
    const obj: any = {};
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.retryState !== undefined &&
      (obj.retryState = retryStateToJSON(message.retryState));
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionFailedEventAttributes>,
  ): WorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseWorkflowExecutionFailedEventAttributes,
    } as WorkflowExecutionFailedEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = object.retryState;
    } else {
      message.retryState = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },
};

const baseWorkflowExecutionTimedOutEventAttributes: object = { retryState: 0 };

export const WorkflowExecutionTimedOutEventAttributes = {
  encode(
    message: WorkflowExecutionTimedOutEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.retryState !== 0) {
      writer.uint32(8).int32(message.retryState);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionTimedOutEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionTimedOutEventAttributes,
    } as WorkflowExecutionTimedOutEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.retryState = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionTimedOutEventAttributes {
    const message = {
      ...baseWorkflowExecutionTimedOutEventAttributes,
    } as WorkflowExecutionTimedOutEventAttributes;
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = retryStateFromJSON(object.retryState);
    } else {
      message.retryState = 0;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionTimedOutEventAttributes): unknown {
    const obj: any = {};
    message.retryState !== undefined &&
      (obj.retryState = retryStateToJSON(message.retryState));
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionTimedOutEventAttributes>,
  ): WorkflowExecutionTimedOutEventAttributes {
    const message = {
      ...baseWorkflowExecutionTimedOutEventAttributes,
    } as WorkflowExecutionTimedOutEventAttributes;
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = object.retryState;
    } else {
      message.retryState = 0;
    }
    return message;
  },
};

const baseWorkflowExecutionContinuedAsNewEventAttributes: object = {
  newExecutionRunId: '',
  workflowTaskCompletedEventId: 0,
  initiator: 0,
};

export const WorkflowExecutionContinuedAsNewEventAttributes = {
  encode(
    message: WorkflowExecutionContinuedAsNewEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.newExecutionRunId !== '') {
      writer.uint32(10).string(message.newExecutionRunId);
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(26).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(34).fork()).ldelim();
    }
    if (message.workflowRunTimeout !== undefined) {
      Duration.encode(
        message.workflowRunTimeout,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.workflowTaskTimeout !== undefined) {
      Duration.encode(
        message.workflowTaskTimeout,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(56).int64(message.workflowTaskCompletedEventId);
    }
    if (message.backoffStartInterval !== undefined) {
      Duration.encode(
        message.backoffStartInterval,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.initiator !== 0) {
      writer.uint32(72).int32(message.initiator);
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(82).fork()).ldelim();
    }
    if (message.lastCompletionResult !== undefined) {
      Payloads.encode(
        message.lastCompletionResult,
        writer.uint32(90).fork(),
      ).ldelim();
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(98).fork()).ldelim();
    }
    if (message.memo !== undefined) {
      Memo.encode(message.memo, writer.uint32(106).fork()).ldelim();
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(114).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionContinuedAsNewEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionContinuedAsNewEventAttributes,
    } as WorkflowExecutionContinuedAsNewEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newExecutionRunId = reader.string();
          break;
        case 2:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 3:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 4:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 5:
          message.workflowRunTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 6:
          message.workflowTaskTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 8:
          message.backoffStartInterval = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.initiator = reader.int32() as any;
          break;
        case 10:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 11:
          message.lastCompletionResult = Payloads.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 12:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 13:
          message.memo = Memo.decode(reader, reader.uint32());
          break;
        case 14:
          message.searchAttributes = SearchAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionContinuedAsNewEventAttributes {
    const message = {
      ...baseWorkflowExecutionContinuedAsNewEventAttributes,
    } as WorkflowExecutionContinuedAsNewEventAttributes;
    if (
      object.newExecutionRunId !== undefined &&
      object.newExecutionRunId !== null
    ) {
      message.newExecutionRunId = String(object.newExecutionRunId);
    } else {
      message.newExecutionRunId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromJSON(object.workflowRunTimeout);
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromJSON(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (
      object.backoffStartInterval !== undefined &&
      object.backoffStartInterval !== null
    ) {
      message.backoffStartInterval = Duration.fromJSON(
        object.backoffStartInterval,
      );
    } else {
      message.backoffStartInterval = undefined;
    }
    if (object.initiator !== undefined && object.initiator !== null) {
      message.initiator = continueAsNewInitiatorFromJSON(object.initiator);
    } else {
      message.initiator = 0;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (
      object.lastCompletionResult !== undefined &&
      object.lastCompletionResult !== null
    ) {
      message.lastCompletionResult = Payloads.fromJSON(
        object.lastCompletionResult,
      );
    } else {
      message.lastCompletionResult = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromJSON(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromJSON(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionContinuedAsNewEventAttributes): unknown {
    const obj: any = {};
    message.newExecutionRunId !== undefined &&
      (obj.newExecutionRunId = message.newExecutionRunId);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.workflowRunTimeout !== undefined &&
      (obj.workflowRunTimeout = message.workflowRunTimeout
        ? Duration.toJSON(message.workflowRunTimeout)
        : undefined);
    message.workflowTaskTimeout !== undefined &&
      (obj.workflowTaskTimeout = message.workflowTaskTimeout
        ? Duration.toJSON(message.workflowTaskTimeout)
        : undefined);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.backoffStartInterval !== undefined &&
      (obj.backoffStartInterval = message.backoffStartInterval
        ? Duration.toJSON(message.backoffStartInterval)
        : undefined);
    message.initiator !== undefined &&
      (obj.initiator = continueAsNewInitiatorToJSON(message.initiator));
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.lastCompletionResult !== undefined &&
      (obj.lastCompletionResult = message.lastCompletionResult
        ? Payloads.toJSON(message.lastCompletionResult)
        : undefined);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.memo !== undefined &&
      (obj.memo = message.memo ? Memo.toJSON(message.memo) : undefined);
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionContinuedAsNewEventAttributes>,
  ): WorkflowExecutionContinuedAsNewEventAttributes {
    const message = {
      ...baseWorkflowExecutionContinuedAsNewEventAttributes,
    } as WorkflowExecutionContinuedAsNewEventAttributes;
    if (
      object.newExecutionRunId !== undefined &&
      object.newExecutionRunId !== null
    ) {
      message.newExecutionRunId = object.newExecutionRunId;
    } else {
      message.newExecutionRunId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromPartial(
        object.workflowRunTimeout,
      );
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromPartial(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (
      object.backoffStartInterval !== undefined &&
      object.backoffStartInterval !== null
    ) {
      message.backoffStartInterval = Duration.fromPartial(
        object.backoffStartInterval,
      );
    } else {
      message.backoffStartInterval = undefined;
    }
    if (object.initiator !== undefined && object.initiator !== null) {
      message.initiator = object.initiator;
    } else {
      message.initiator = 0;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (
      object.lastCompletionResult !== undefined &&
      object.lastCompletionResult !== null
    ) {
      message.lastCompletionResult = Payloads.fromPartial(
        object.lastCompletionResult,
      );
    } else {
      message.lastCompletionResult = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromPartial(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromPartial(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    return message;
  },
};

const baseWorkflowTaskScheduledEventAttributes: object = { attempt: 0 };

export const WorkflowTaskScheduledEventAttributes = {
  encode(
    message: WorkflowTaskScheduledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(10).fork()).ldelim();
    }
    if (message.startToCloseTimeout !== undefined) {
      Duration.encode(
        message.startToCloseTimeout,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.attempt !== 0) {
      writer.uint32(24).int32(message.attempt);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowTaskScheduledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowTaskScheduledEventAttributes,
    } as WorkflowTaskScheduledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 2:
          message.startToCloseTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.attempt = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowTaskScheduledEventAttributes {
    const message = {
      ...baseWorkflowTaskScheduledEventAttributes,
    } as WorkflowTaskScheduledEventAttributes;
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (
      object.startToCloseTimeout !== undefined &&
      object.startToCloseTimeout !== null
    ) {
      message.startToCloseTimeout = Duration.fromJSON(
        object.startToCloseTimeout,
      );
    } else {
      message.startToCloseTimeout = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = Number(object.attempt);
    } else {
      message.attempt = 0;
    }
    return message;
  },

  toJSON(message: WorkflowTaskScheduledEventAttributes): unknown {
    const obj: any = {};
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.startToCloseTimeout !== undefined &&
      (obj.startToCloseTimeout = message.startToCloseTimeout
        ? Duration.toJSON(message.startToCloseTimeout)
        : undefined);
    message.attempt !== undefined && (obj.attempt = message.attempt);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowTaskScheduledEventAttributes>,
  ): WorkflowTaskScheduledEventAttributes {
    const message = {
      ...baseWorkflowTaskScheduledEventAttributes,
    } as WorkflowTaskScheduledEventAttributes;
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (
      object.startToCloseTimeout !== undefined &&
      object.startToCloseTimeout !== null
    ) {
      message.startToCloseTimeout = Duration.fromPartial(
        object.startToCloseTimeout,
      );
    } else {
      message.startToCloseTimeout = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = object.attempt;
    } else {
      message.attempt = 0;
    }
    return message;
  },
};

const baseWorkflowTaskStartedEventAttributes: object = {
  scheduledEventId: 0,
  identity: '',
  requestId: '',
};

export const WorkflowTaskStartedEventAttributes = {
  encode(
    message: WorkflowTaskStartedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.scheduledEventId !== 0) {
      writer.uint32(8).int64(message.scheduledEventId);
    }
    if (message.identity !== '') {
      writer.uint32(18).string(message.identity);
    }
    if (message.requestId !== '') {
      writer.uint32(26).string(message.requestId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowTaskStartedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowTaskStartedEventAttributes,
    } as WorkflowTaskStartedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.identity = reader.string();
          break;
        case 3:
          message.requestId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowTaskStartedEventAttributes {
    const message = {
      ...baseWorkflowTaskStartedEventAttributes,
    } as WorkflowTaskStartedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    } else {
      message.requestId = '';
    }
    return message;
  },

  toJSON(message: WorkflowTaskStartedEventAttributes): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowTaskStartedEventAttributes>,
  ): WorkflowTaskStartedEventAttributes {
    const message = {
      ...baseWorkflowTaskStartedEventAttributes,
    } as WorkflowTaskStartedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    } else {
      message.requestId = '';
    }
    return message;
  },
};

const baseWorkflowTaskCompletedEventAttributes: object = {
  scheduledEventId: 0,
  startedEventId: 0,
  identity: '',
  binaryChecksum: '',
};

export const WorkflowTaskCompletedEventAttributes = {
  encode(
    message: WorkflowTaskCompletedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.scheduledEventId !== 0) {
      writer.uint32(8).int64(message.scheduledEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(16).int64(message.startedEventId);
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    if (message.binaryChecksum !== '') {
      writer.uint32(34).string(message.binaryChecksum);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowTaskCompletedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowTaskCompletedEventAttributes,
    } as WorkflowTaskCompletedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.identity = reader.string();
          break;
        case 4:
          message.binaryChecksum = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowTaskCompletedEventAttributes {
    const message = {
      ...baseWorkflowTaskCompletedEventAttributes,
    } as WorkflowTaskCompletedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = String(object.binaryChecksum);
    } else {
      message.binaryChecksum = '';
    }
    return message;
  },

  toJSON(message: WorkflowTaskCompletedEventAttributes): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    message.binaryChecksum !== undefined &&
      (obj.binaryChecksum = message.binaryChecksum);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowTaskCompletedEventAttributes>,
  ): WorkflowTaskCompletedEventAttributes {
    const message = {
      ...baseWorkflowTaskCompletedEventAttributes,
    } as WorkflowTaskCompletedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = object.binaryChecksum;
    } else {
      message.binaryChecksum = '';
    }
    return message;
  },
};

const baseWorkflowTaskTimedOutEventAttributes: object = {
  scheduledEventId: 0,
  startedEventId: 0,
  timeoutType: 0,
};

export const WorkflowTaskTimedOutEventAttributes = {
  encode(
    message: WorkflowTaskTimedOutEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.scheduledEventId !== 0) {
      writer.uint32(8).int64(message.scheduledEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(16).int64(message.startedEventId);
    }
    if (message.timeoutType !== 0) {
      writer.uint32(24).int32(message.timeoutType);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowTaskTimedOutEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowTaskTimedOutEventAttributes,
    } as WorkflowTaskTimedOutEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.timeoutType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowTaskTimedOutEventAttributes {
    const message = {
      ...baseWorkflowTaskTimedOutEventAttributes,
    } as WorkflowTaskTimedOutEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.timeoutType !== undefined && object.timeoutType !== null) {
      message.timeoutType = timeoutTypeFromJSON(object.timeoutType);
    } else {
      message.timeoutType = 0;
    }
    return message;
  },

  toJSON(message: WorkflowTaskTimedOutEventAttributes): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.timeoutType !== undefined &&
      (obj.timeoutType = timeoutTypeToJSON(message.timeoutType));
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowTaskTimedOutEventAttributes>,
  ): WorkflowTaskTimedOutEventAttributes {
    const message = {
      ...baseWorkflowTaskTimedOutEventAttributes,
    } as WorkflowTaskTimedOutEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.timeoutType !== undefined && object.timeoutType !== null) {
      message.timeoutType = object.timeoutType;
    } else {
      message.timeoutType = 0;
    }
    return message;
  },
};

const baseWorkflowTaskFailedEventAttributes: object = {
  scheduledEventId: 0,
  startedEventId: 0,
  cause: 0,
  identity: '',
  baseRunId: '',
  newRunId: '',
  forkEventVersion: 0,
  binaryChecksum: '',
};

export const WorkflowTaskFailedEventAttributes = {
  encode(
    message: WorkflowTaskFailedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.scheduledEventId !== 0) {
      writer.uint32(8).int64(message.scheduledEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(16).int64(message.startedEventId);
    }
    if (message.cause !== 0) {
      writer.uint32(24).int32(message.cause);
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(34).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(42).string(message.identity);
    }
    if (message.baseRunId !== '') {
      writer.uint32(50).string(message.baseRunId);
    }
    if (message.newRunId !== '') {
      writer.uint32(58).string(message.newRunId);
    }
    if (message.forkEventVersion !== 0) {
      writer.uint32(64).int64(message.forkEventVersion);
    }
    if (message.binaryChecksum !== '') {
      writer.uint32(74).string(message.binaryChecksum);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowTaskFailedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowTaskFailedEventAttributes,
    } as WorkflowTaskFailedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.cause = reader.int32() as any;
          break;
        case 4:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 5:
          message.identity = reader.string();
          break;
        case 6:
          message.baseRunId = reader.string();
          break;
        case 7:
          message.newRunId = reader.string();
          break;
        case 8:
          message.forkEventVersion = longToNumber(reader.int64() as Long);
          break;
        case 9:
          message.binaryChecksum = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowTaskFailedEventAttributes {
    const message = {
      ...baseWorkflowTaskFailedEventAttributes,
    } as WorkflowTaskFailedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = workflowTaskFailedCauseFromJSON(object.cause);
    } else {
      message.cause = 0;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.baseRunId !== undefined && object.baseRunId !== null) {
      message.baseRunId = String(object.baseRunId);
    } else {
      message.baseRunId = '';
    }
    if (object.newRunId !== undefined && object.newRunId !== null) {
      message.newRunId = String(object.newRunId);
    } else {
      message.newRunId = '';
    }
    if (
      object.forkEventVersion !== undefined &&
      object.forkEventVersion !== null
    ) {
      message.forkEventVersion = Number(object.forkEventVersion);
    } else {
      message.forkEventVersion = 0;
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = String(object.binaryChecksum);
    } else {
      message.binaryChecksum = '';
    }
    return message;
  },

  toJSON(message: WorkflowTaskFailedEventAttributes): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.cause !== undefined &&
      (obj.cause = workflowTaskFailedCauseToJSON(message.cause));
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    message.baseRunId !== undefined && (obj.baseRunId = message.baseRunId);
    message.newRunId !== undefined && (obj.newRunId = message.newRunId);
    message.forkEventVersion !== undefined &&
      (obj.forkEventVersion = message.forkEventVersion);
    message.binaryChecksum !== undefined &&
      (obj.binaryChecksum = message.binaryChecksum);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowTaskFailedEventAttributes>,
  ): WorkflowTaskFailedEventAttributes {
    const message = {
      ...baseWorkflowTaskFailedEventAttributes,
    } as WorkflowTaskFailedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = object.cause;
    } else {
      message.cause = 0;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.baseRunId !== undefined && object.baseRunId !== null) {
      message.baseRunId = object.baseRunId;
    } else {
      message.baseRunId = '';
    }
    if (object.newRunId !== undefined && object.newRunId !== null) {
      message.newRunId = object.newRunId;
    } else {
      message.newRunId = '';
    }
    if (
      object.forkEventVersion !== undefined &&
      object.forkEventVersion !== null
    ) {
      message.forkEventVersion = object.forkEventVersion;
    } else {
      message.forkEventVersion = 0;
    }
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = object.binaryChecksum;
    } else {
      message.binaryChecksum = '';
    }
    return message;
  },
};

const baseActivityTaskScheduledEventAttributes: object = {
  activityId: '',
  namespace: '',
  workflowTaskCompletedEventId: 0,
};

export const ActivityTaskScheduledEventAttributes = {
  encode(
    message: ActivityTaskScheduledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.activityId !== '') {
      writer.uint32(10).string(message.activityId);
    }
    if (message.activityType !== undefined) {
      ActivityType.encode(
        message.activityType,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.namespace !== '') {
      writer.uint32(26).string(message.namespace);
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(34).fork()).ldelim();
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(42).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(50).fork()).ldelim();
    }
    if (message.scheduleToCloseTimeout !== undefined) {
      Duration.encode(
        message.scheduleToCloseTimeout,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.scheduleToStartTimeout !== undefined) {
      Duration.encode(
        message.scheduleToStartTimeout,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.startToCloseTimeout !== undefined) {
      Duration.encode(
        message.startToCloseTimeout,
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.heartbeatTimeout !== undefined) {
      Duration.encode(
        message.heartbeatTimeout,
        writer.uint32(82).fork(),
      ).ldelim();
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(88).int64(message.workflowTaskCompletedEventId);
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ActivityTaskScheduledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseActivityTaskScheduledEventAttributes,
    } as ActivityTaskScheduledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.activityId = reader.string();
          break;
        case 2:
          message.activityType = ActivityType.decode(reader, reader.uint32());
          break;
        case 3:
          message.namespace = reader.string();
          break;
        case 4:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 5:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 6:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 7:
          message.scheduleToCloseTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 8:
          message.scheduleToStartTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.startToCloseTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 10:
          message.heartbeatTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 11:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 12:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActivityTaskScheduledEventAttributes {
    const message = {
      ...baseActivityTaskScheduledEventAttributes,
    } as ActivityTaskScheduledEventAttributes;
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = String(object.activityId);
    } else {
      message.activityId = '';
    }
    if (object.activityType !== undefined && object.activityType !== null) {
      message.activityType = ActivityType.fromJSON(object.activityType);
    } else {
      message.activityType = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.scheduleToCloseTimeout !== undefined &&
      object.scheduleToCloseTimeout !== null
    ) {
      message.scheduleToCloseTimeout = Duration.fromJSON(
        object.scheduleToCloseTimeout,
      );
    } else {
      message.scheduleToCloseTimeout = undefined;
    }
    if (
      object.scheduleToStartTimeout !== undefined &&
      object.scheduleToStartTimeout !== null
    ) {
      message.scheduleToStartTimeout = Duration.fromJSON(
        object.scheduleToStartTimeout,
      );
    } else {
      message.scheduleToStartTimeout = undefined;
    }
    if (
      object.startToCloseTimeout !== undefined &&
      object.startToCloseTimeout !== null
    ) {
      message.startToCloseTimeout = Duration.fromJSON(
        object.startToCloseTimeout,
      );
    } else {
      message.startToCloseTimeout = undefined;
    }
    if (
      object.heartbeatTimeout !== undefined &&
      object.heartbeatTimeout !== null
    ) {
      message.heartbeatTimeout = Duration.fromJSON(object.heartbeatTimeout);
    } else {
      message.heartbeatTimeout = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    return message;
  },

  toJSON(message: ActivityTaskScheduledEventAttributes): unknown {
    const obj: any = {};
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.activityType !== undefined &&
      (obj.activityType = message.activityType
        ? ActivityType.toJSON(message.activityType)
        : undefined);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.scheduleToCloseTimeout !== undefined &&
      (obj.scheduleToCloseTimeout = message.scheduleToCloseTimeout
        ? Duration.toJSON(message.scheduleToCloseTimeout)
        : undefined);
    message.scheduleToStartTimeout !== undefined &&
      (obj.scheduleToStartTimeout = message.scheduleToStartTimeout
        ? Duration.toJSON(message.scheduleToStartTimeout)
        : undefined);
    message.startToCloseTimeout !== undefined &&
      (obj.startToCloseTimeout = message.startToCloseTimeout
        ? Duration.toJSON(message.startToCloseTimeout)
        : undefined);
    message.heartbeatTimeout !== undefined &&
      (obj.heartbeatTimeout = message.heartbeatTimeout
        ? Duration.toJSON(message.heartbeatTimeout)
        : undefined);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ActivityTaskScheduledEventAttributes>,
  ): ActivityTaskScheduledEventAttributes {
    const message = {
      ...baseActivityTaskScheduledEventAttributes,
    } as ActivityTaskScheduledEventAttributes;
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = object.activityId;
    } else {
      message.activityId = '';
    }
    if (object.activityType !== undefined && object.activityType !== null) {
      message.activityType = ActivityType.fromPartial(object.activityType);
    } else {
      message.activityType = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.scheduleToCloseTimeout !== undefined &&
      object.scheduleToCloseTimeout !== null
    ) {
      message.scheduleToCloseTimeout = Duration.fromPartial(
        object.scheduleToCloseTimeout,
      );
    } else {
      message.scheduleToCloseTimeout = undefined;
    }
    if (
      object.scheduleToStartTimeout !== undefined &&
      object.scheduleToStartTimeout !== null
    ) {
      message.scheduleToStartTimeout = Duration.fromPartial(
        object.scheduleToStartTimeout,
      );
    } else {
      message.scheduleToStartTimeout = undefined;
    }
    if (
      object.startToCloseTimeout !== undefined &&
      object.startToCloseTimeout !== null
    ) {
      message.startToCloseTimeout = Duration.fromPartial(
        object.startToCloseTimeout,
      );
    } else {
      message.startToCloseTimeout = undefined;
    }
    if (
      object.heartbeatTimeout !== undefined &&
      object.heartbeatTimeout !== null
    ) {
      message.heartbeatTimeout = Duration.fromPartial(object.heartbeatTimeout);
    } else {
      message.heartbeatTimeout = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    return message;
  },
};

const baseActivityTaskStartedEventAttributes: object = {
  scheduledEventId: 0,
  identity: '',
  requestId: '',
  attempt: 0,
};

export const ActivityTaskStartedEventAttributes = {
  encode(
    message: ActivityTaskStartedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.scheduledEventId !== 0) {
      writer.uint32(8).int64(message.scheduledEventId);
    }
    if (message.identity !== '') {
      writer.uint32(18).string(message.identity);
    }
    if (message.requestId !== '') {
      writer.uint32(26).string(message.requestId);
    }
    if (message.attempt !== 0) {
      writer.uint32(32).int32(message.attempt);
    }
    if (message.lastFailure !== undefined) {
      Failure.encode(message.lastFailure, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ActivityTaskStartedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseActivityTaskStartedEventAttributes,
    } as ActivityTaskStartedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.identity = reader.string();
          break;
        case 3:
          message.requestId = reader.string();
          break;
        case 4:
          message.attempt = reader.int32();
          break;
        case 5:
          message.lastFailure = Failure.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActivityTaskStartedEventAttributes {
    const message = {
      ...baseActivityTaskStartedEventAttributes,
    } as ActivityTaskStartedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    } else {
      message.requestId = '';
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = Number(object.attempt);
    } else {
      message.attempt = 0;
    }
    if (object.lastFailure !== undefined && object.lastFailure !== null) {
      message.lastFailure = Failure.fromJSON(object.lastFailure);
    } else {
      message.lastFailure = undefined;
    }
    return message;
  },

  toJSON(message: ActivityTaskStartedEventAttributes): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.attempt !== undefined && (obj.attempt = message.attempt);
    message.lastFailure !== undefined &&
      (obj.lastFailure = message.lastFailure
        ? Failure.toJSON(message.lastFailure)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ActivityTaskStartedEventAttributes>,
  ): ActivityTaskStartedEventAttributes {
    const message = {
      ...baseActivityTaskStartedEventAttributes,
    } as ActivityTaskStartedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    } else {
      message.requestId = '';
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = object.attempt;
    } else {
      message.attempt = 0;
    }
    if (object.lastFailure !== undefined && object.lastFailure !== null) {
      message.lastFailure = Failure.fromPartial(object.lastFailure);
    } else {
      message.lastFailure = undefined;
    }
    return message;
  },
};

const baseActivityTaskCompletedEventAttributes: object = {
  scheduledEventId: 0,
  startedEventId: 0,
  identity: '',
};

export const ActivityTaskCompletedEventAttributes = {
  encode(
    message: ActivityTaskCompletedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.result !== undefined) {
      Payloads.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    if (message.scheduledEventId !== 0) {
      writer.uint32(16).int64(message.scheduledEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(24).int64(message.startedEventId);
    }
    if (message.identity !== '') {
      writer.uint32(34).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ActivityTaskCompletedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseActivityTaskCompletedEventAttributes,
    } as ActivityTaskCompletedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.result = Payloads.decode(reader, reader.uint32());
          break;
        case 2:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 4:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActivityTaskCompletedEventAttributes {
    const message = {
      ...baseActivityTaskCompletedEventAttributes,
    } as ActivityTaskCompletedEventAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromJSON(object.result);
    } else {
      message.result = undefined;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: ActivityTaskCompletedEventAttributes): unknown {
    const obj: any = {};
    message.result !== undefined &&
      (obj.result = message.result
        ? Payloads.toJSON(message.result)
        : undefined);
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ActivityTaskCompletedEventAttributes>,
  ): ActivityTaskCompletedEventAttributes {
    const message = {
      ...baseActivityTaskCompletedEventAttributes,
    } as ActivityTaskCompletedEventAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromPartial(object.result);
    } else {
      message.result = undefined;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseActivityTaskFailedEventAttributes: object = {
  scheduledEventId: 0,
  startedEventId: 0,
  identity: '',
  retryState: 0,
};

export const ActivityTaskFailedEventAttributes = {
  encode(
    message: ActivityTaskFailedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(10).fork()).ldelim();
    }
    if (message.scheduledEventId !== 0) {
      writer.uint32(16).int64(message.scheduledEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(24).int64(message.startedEventId);
    }
    if (message.identity !== '') {
      writer.uint32(34).string(message.identity);
    }
    if (message.retryState !== 0) {
      writer.uint32(40).int32(message.retryState);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ActivityTaskFailedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseActivityTaskFailedEventAttributes,
    } as ActivityTaskFailedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 2:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 4:
          message.identity = reader.string();
          break;
        case 5:
          message.retryState = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActivityTaskFailedEventAttributes {
    const message = {
      ...baseActivityTaskFailedEventAttributes,
    } as ActivityTaskFailedEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = retryStateFromJSON(object.retryState);
    } else {
      message.retryState = 0;
    }
    return message;
  },

  toJSON(message: ActivityTaskFailedEventAttributes): unknown {
    const obj: any = {};
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    message.retryState !== undefined &&
      (obj.retryState = retryStateToJSON(message.retryState));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ActivityTaskFailedEventAttributes>,
  ): ActivityTaskFailedEventAttributes {
    const message = {
      ...baseActivityTaskFailedEventAttributes,
    } as ActivityTaskFailedEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = object.retryState;
    } else {
      message.retryState = 0;
    }
    return message;
  },
};

const baseActivityTaskTimedOutEventAttributes: object = {
  scheduledEventId: 0,
  startedEventId: 0,
  retryState: 0,
};

export const ActivityTaskTimedOutEventAttributes = {
  encode(
    message: ActivityTaskTimedOutEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(10).fork()).ldelim();
    }
    if (message.scheduledEventId !== 0) {
      writer.uint32(16).int64(message.scheduledEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(24).int64(message.startedEventId);
    }
    if (message.retryState !== 0) {
      writer.uint32(32).int32(message.retryState);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ActivityTaskTimedOutEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseActivityTaskTimedOutEventAttributes,
    } as ActivityTaskTimedOutEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 2:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 4:
          message.retryState = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActivityTaskTimedOutEventAttributes {
    const message = {
      ...baseActivityTaskTimedOutEventAttributes,
    } as ActivityTaskTimedOutEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = retryStateFromJSON(object.retryState);
    } else {
      message.retryState = 0;
    }
    return message;
  },

  toJSON(message: ActivityTaskTimedOutEventAttributes): unknown {
    const obj: any = {};
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.retryState !== undefined &&
      (obj.retryState = retryStateToJSON(message.retryState));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ActivityTaskTimedOutEventAttributes>,
  ): ActivityTaskTimedOutEventAttributes {
    const message = {
      ...baseActivityTaskTimedOutEventAttributes,
    } as ActivityTaskTimedOutEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = object.retryState;
    } else {
      message.retryState = 0;
    }
    return message;
  },
};

const baseActivityTaskCancelRequestedEventAttributes: object = {
  scheduledEventId: 0,
  workflowTaskCompletedEventId: 0,
};

export const ActivityTaskCancelRequestedEventAttributes = {
  encode(
    message: ActivityTaskCancelRequestedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.scheduledEventId !== 0) {
      writer.uint32(8).int64(message.scheduledEventId);
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(16).int64(message.workflowTaskCompletedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ActivityTaskCancelRequestedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseActivityTaskCancelRequestedEventAttributes,
    } as ActivityTaskCancelRequestedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActivityTaskCancelRequestedEventAttributes {
    const message = {
      ...baseActivityTaskCancelRequestedEventAttributes,
    } as ActivityTaskCancelRequestedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },

  toJSON(message: ActivityTaskCancelRequestedEventAttributes): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ActivityTaskCancelRequestedEventAttributes>,
  ): ActivityTaskCancelRequestedEventAttributes {
    const message = {
      ...baseActivityTaskCancelRequestedEventAttributes,
    } as ActivityTaskCancelRequestedEventAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },
};

const baseActivityTaskCanceledEventAttributes: object = {
  latestCancelRequestedEventId: 0,
  scheduledEventId: 0,
  startedEventId: 0,
  identity: '',
};

export const ActivityTaskCanceledEventAttributes = {
  encode(
    message: ActivityTaskCanceledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(10).fork()).ldelim();
    }
    if (message.latestCancelRequestedEventId !== 0) {
      writer.uint32(16).int64(message.latestCancelRequestedEventId);
    }
    if (message.scheduledEventId !== 0) {
      writer.uint32(24).int64(message.scheduledEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(32).int64(message.startedEventId);
    }
    if (message.identity !== '') {
      writer.uint32(42).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ActivityTaskCanceledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseActivityTaskCanceledEventAttributes,
    } as ActivityTaskCanceledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 2:
          message.latestCancelRequestedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 3:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        case 4:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ActivityTaskCanceledEventAttributes {
    const message = {
      ...baseActivityTaskCanceledEventAttributes,
    } as ActivityTaskCanceledEventAttributes;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (
      object.latestCancelRequestedEventId !== undefined &&
      object.latestCancelRequestedEventId !== null
    ) {
      message.latestCancelRequestedEventId = Number(
        object.latestCancelRequestedEventId,
      );
    } else {
      message.latestCancelRequestedEventId = 0;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: ActivityTaskCanceledEventAttributes): unknown {
    const obj: any = {};
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.latestCancelRequestedEventId !== undefined &&
      (obj.latestCancelRequestedEventId = message.latestCancelRequestedEventId);
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ActivityTaskCanceledEventAttributes>,
  ): ActivityTaskCanceledEventAttributes {
    const message = {
      ...baseActivityTaskCanceledEventAttributes,
    } as ActivityTaskCanceledEventAttributes;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (
      object.latestCancelRequestedEventId !== undefined &&
      object.latestCancelRequestedEventId !== null
    ) {
      message.latestCancelRequestedEventId =
        object.latestCancelRequestedEventId;
    } else {
      message.latestCancelRequestedEventId = 0;
    }
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseTimerStartedEventAttributes: object = {
  timerId: '',
  workflowTaskCompletedEventId: 0,
};

export const TimerStartedEventAttributes = {
  encode(
    message: TimerStartedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.timerId !== '') {
      writer.uint32(10).string(message.timerId);
    }
    if (message.startToFireTimeout !== undefined) {
      Duration.encode(
        message.startToFireTimeout,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(24).int64(message.workflowTaskCompletedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TimerStartedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseTimerStartedEventAttributes,
    } as TimerStartedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timerId = reader.string();
          break;
        case 2:
          message.startToFireTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 3:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TimerStartedEventAttributes {
    const message = {
      ...baseTimerStartedEventAttributes,
    } as TimerStartedEventAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = String(object.timerId);
    } else {
      message.timerId = '';
    }
    if (
      object.startToFireTimeout !== undefined &&
      object.startToFireTimeout !== null
    ) {
      message.startToFireTimeout = Duration.fromJSON(object.startToFireTimeout);
    } else {
      message.startToFireTimeout = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },

  toJSON(message: TimerStartedEventAttributes): unknown {
    const obj: any = {};
    message.timerId !== undefined && (obj.timerId = message.timerId);
    message.startToFireTimeout !== undefined &&
      (obj.startToFireTimeout = message.startToFireTimeout
        ? Duration.toJSON(message.startToFireTimeout)
        : undefined);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<TimerStartedEventAttributes>,
  ): TimerStartedEventAttributes {
    const message = {
      ...baseTimerStartedEventAttributes,
    } as TimerStartedEventAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = object.timerId;
    } else {
      message.timerId = '';
    }
    if (
      object.startToFireTimeout !== undefined &&
      object.startToFireTimeout !== null
    ) {
      message.startToFireTimeout = Duration.fromPartial(
        object.startToFireTimeout,
      );
    } else {
      message.startToFireTimeout = undefined;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },
};

const baseTimerFiredEventAttributes: object = {
  timerId: '',
  startedEventId: 0,
};

export const TimerFiredEventAttributes = {
  encode(
    message: TimerFiredEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.timerId !== '') {
      writer.uint32(10).string(message.timerId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(16).int64(message.startedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TimerFiredEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseTimerFiredEventAttributes,
    } as TimerFiredEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timerId = reader.string();
          break;
        case 2:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TimerFiredEventAttributes {
    const message = {
      ...baseTimerFiredEventAttributes,
    } as TimerFiredEventAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = String(object.timerId);
    } else {
      message.timerId = '';
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    return message;
  },

  toJSON(message: TimerFiredEventAttributes): unknown {
    const obj: any = {};
    message.timerId !== undefined && (obj.timerId = message.timerId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<TimerFiredEventAttributes>,
  ): TimerFiredEventAttributes {
    const message = {
      ...baseTimerFiredEventAttributes,
    } as TimerFiredEventAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = object.timerId;
    } else {
      message.timerId = '';
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    return message;
  },
};

const baseTimerCanceledEventAttributes: object = {
  timerId: '',
  startedEventId: 0,
  workflowTaskCompletedEventId: 0,
  identity: '',
};

export const TimerCanceledEventAttributes = {
  encode(
    message: TimerCanceledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.timerId !== '') {
      writer.uint32(10).string(message.timerId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(16).int64(message.startedEventId);
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(24).int64(message.workflowTaskCompletedEventId);
    }
    if (message.identity !== '') {
      writer.uint32(34).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TimerCanceledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseTimerCanceledEventAttributes,
    } as TimerCanceledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timerId = reader.string();
          break;
        case 2:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 4:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TimerCanceledEventAttributes {
    const message = {
      ...baseTimerCanceledEventAttributes,
    } as TimerCanceledEventAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = String(object.timerId);
    } else {
      message.timerId = '';
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: TimerCanceledEventAttributes): unknown {
    const obj: any = {};
    message.timerId !== undefined && (obj.timerId = message.timerId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<TimerCanceledEventAttributes>,
  ): TimerCanceledEventAttributes {
    const message = {
      ...baseTimerCanceledEventAttributes,
    } as TimerCanceledEventAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = object.timerId;
    } else {
      message.timerId = '';
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseWorkflowExecutionCancelRequestedEventAttributes: object = {
  cause: '',
  externalInitiatedEventId: 0,
  identity: '',
};

export const WorkflowExecutionCancelRequestedEventAttributes = {
  encode(
    message: WorkflowExecutionCancelRequestedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cause !== '') {
      writer.uint32(10).string(message.cause);
    }
    if (message.externalInitiatedEventId !== 0) {
      writer.uint32(16).int64(message.externalInitiatedEventId);
    }
    if (message.externalWorkflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.externalWorkflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(34).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionCancelRequestedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionCancelRequestedEventAttributes,
    } as WorkflowExecutionCancelRequestedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cause = reader.string();
          break;
        case 2:
          message.externalInitiatedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 3:
          message.externalWorkflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionCancelRequestedEventAttributes {
    const message = {
      ...baseWorkflowExecutionCancelRequestedEventAttributes,
    } as WorkflowExecutionCancelRequestedEventAttributes;
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = String(object.cause);
    } else {
      message.cause = '';
    }
    if (
      object.externalInitiatedEventId !== undefined &&
      object.externalInitiatedEventId !== null
    ) {
      message.externalInitiatedEventId = Number(
        object.externalInitiatedEventId,
      );
    } else {
      message.externalInitiatedEventId = 0;
    }
    if (
      object.externalWorkflowExecution !== undefined &&
      object.externalWorkflowExecution !== null
    ) {
      message.externalWorkflowExecution = WorkflowExecution.fromJSON(
        object.externalWorkflowExecution,
      );
    } else {
      message.externalWorkflowExecution = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: WorkflowExecutionCancelRequestedEventAttributes): unknown {
    const obj: any = {};
    message.cause !== undefined && (obj.cause = message.cause);
    message.externalInitiatedEventId !== undefined &&
      (obj.externalInitiatedEventId = message.externalInitiatedEventId);
    message.externalWorkflowExecution !== undefined &&
      (obj.externalWorkflowExecution = message.externalWorkflowExecution
        ? WorkflowExecution.toJSON(message.externalWorkflowExecution)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionCancelRequestedEventAttributes>,
  ): WorkflowExecutionCancelRequestedEventAttributes {
    const message = {
      ...baseWorkflowExecutionCancelRequestedEventAttributes,
    } as WorkflowExecutionCancelRequestedEventAttributes;
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = object.cause;
    } else {
      message.cause = '';
    }
    if (
      object.externalInitiatedEventId !== undefined &&
      object.externalInitiatedEventId !== null
    ) {
      message.externalInitiatedEventId = object.externalInitiatedEventId;
    } else {
      message.externalInitiatedEventId = 0;
    }
    if (
      object.externalWorkflowExecution !== undefined &&
      object.externalWorkflowExecution !== null
    ) {
      message.externalWorkflowExecution = WorkflowExecution.fromPartial(
        object.externalWorkflowExecution,
      );
    } else {
      message.externalWorkflowExecution = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseWorkflowExecutionCanceledEventAttributes: object = {
  workflowTaskCompletedEventId: 0,
};

export const WorkflowExecutionCanceledEventAttributes = {
  encode(
    message: WorkflowExecutionCanceledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(8).int64(message.workflowTaskCompletedEventId);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionCanceledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionCanceledEventAttributes,
    } as WorkflowExecutionCanceledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 2:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionCanceledEventAttributes {
    const message = {
      ...baseWorkflowExecutionCanceledEventAttributes,
    } as WorkflowExecutionCanceledEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionCanceledEventAttributes): unknown {
    const obj: any = {};
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionCanceledEventAttributes>,
  ): WorkflowExecutionCanceledEventAttributes {
    const message = {
      ...baseWorkflowExecutionCanceledEventAttributes,
    } as WorkflowExecutionCanceledEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },
};

const baseMarkerRecordedEventAttributes: object = {
  markerName: '',
  workflowTaskCompletedEventId: 0,
};

export const MarkerRecordedEventAttributes = {
  encode(
    message: MarkerRecordedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.markerName !== '') {
      writer.uint32(10).string(message.markerName);
    }
    Object.entries(message.details).forEach(([key, value]) => {
      MarkerRecordedEventAttributes_DetailsEntry.encode(
        { key: key as any, value },
        writer.uint32(18).fork(),
      ).ldelim();
    });
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(24).int64(message.workflowTaskCompletedEventId);
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(34).fork()).ldelim();
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MarkerRecordedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMarkerRecordedEventAttributes,
    } as MarkerRecordedEventAttributes;
    message.details = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.markerName = reader.string();
          break;
        case 2:
          const entry2 = MarkerRecordedEventAttributes_DetailsEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry2.value !== undefined) {
            message.details[entry2.key] = entry2.value;
          }
          break;
        case 3:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 4:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 5:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MarkerRecordedEventAttributes {
    const message = {
      ...baseMarkerRecordedEventAttributes,
    } as MarkerRecordedEventAttributes;
    message.details = {};
    if (object.markerName !== undefined && object.markerName !== null) {
      message.markerName = String(object.markerName);
    } else {
      message.markerName = '';
    }
    if (object.details !== undefined && object.details !== null) {
      Object.entries(object.details).forEach(([key, value]) => {
        message.details[key] = Payloads.fromJSON(value);
      });
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    return message;
  },

  toJSON(message: MarkerRecordedEventAttributes): unknown {
    const obj: any = {};
    message.markerName !== undefined && (obj.markerName = message.markerName);
    obj.details = {};
    if (message.details) {
      Object.entries(message.details).forEach(([k, v]) => {
        obj.details[k] = Payloads.toJSON(v);
      });
    }
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MarkerRecordedEventAttributes>,
  ): MarkerRecordedEventAttributes {
    const message = {
      ...baseMarkerRecordedEventAttributes,
    } as MarkerRecordedEventAttributes;
    message.details = {};
    if (object.markerName !== undefined && object.markerName !== null) {
      message.markerName = object.markerName;
    } else {
      message.markerName = '';
    }
    if (object.details !== undefined && object.details !== null) {
      Object.entries(object.details).forEach(([key, value]) => {
        if (value !== undefined) {
          message.details[key] = Payloads.fromPartial(value);
        }
      });
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    return message;
  },
};

const baseMarkerRecordedEventAttributes_DetailsEntry: object = { key: '' };

export const MarkerRecordedEventAttributes_DetailsEntry = {
  encode(
    message: MarkerRecordedEventAttributes_DetailsEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Payloads.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): MarkerRecordedEventAttributes_DetailsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMarkerRecordedEventAttributes_DetailsEntry,
    } as MarkerRecordedEventAttributes_DetailsEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = Payloads.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MarkerRecordedEventAttributes_DetailsEntry {
    const message = {
      ...baseMarkerRecordedEventAttributes_DetailsEntry,
    } as MarkerRecordedEventAttributes_DetailsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payloads.fromJSON(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },

  toJSON(message: MarkerRecordedEventAttributes_DetailsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value ? Payloads.toJSON(message.value) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MarkerRecordedEventAttributes_DetailsEntry>,
  ): MarkerRecordedEventAttributes_DetailsEntry {
    const message = {
      ...baseMarkerRecordedEventAttributes_DetailsEntry,
    } as MarkerRecordedEventAttributes_DetailsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payloads.fromPartial(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },
};

const baseWorkflowExecutionSignaledEventAttributes: object = {
  signalName: '',
  identity: '',
};

export const WorkflowExecutionSignaledEventAttributes = {
  encode(
    message: WorkflowExecutionSignaledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.signalName !== '') {
      writer.uint32(10).string(message.signalName);
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionSignaledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionSignaledEventAttributes,
    } as WorkflowExecutionSignaledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signalName = reader.string();
          break;
        case 2:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionSignaledEventAttributes {
    const message = {
      ...baseWorkflowExecutionSignaledEventAttributes,
    } as WorkflowExecutionSignaledEventAttributes;
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = String(object.signalName);
    } else {
      message.signalName = '';
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: WorkflowExecutionSignaledEventAttributes): unknown {
    const obj: any = {};
    message.signalName !== undefined && (obj.signalName = message.signalName);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionSignaledEventAttributes>,
  ): WorkflowExecutionSignaledEventAttributes {
    const message = {
      ...baseWorkflowExecutionSignaledEventAttributes,
    } as WorkflowExecutionSignaledEventAttributes;
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = object.signalName;
    } else {
      message.signalName = '';
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseWorkflowExecutionTerminatedEventAttributes: object = {
  reason: '',
  identity: '',
};

export const WorkflowExecutionTerminatedEventAttributes = {
  encode(
    message: WorkflowExecutionTerminatedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.reason !== '') {
      writer.uint32(10).string(message.reason);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(18).fork()).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(26).string(message.identity);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionTerminatedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionTerminatedEventAttributes,
    } as WorkflowExecutionTerminatedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.reason = reader.string();
          break;
        case 2:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 3:
          message.identity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionTerminatedEventAttributes {
    const message = {
      ...baseWorkflowExecutionTerminatedEventAttributes,
    } as WorkflowExecutionTerminatedEventAttributes;
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = String(object.reason);
    } else {
      message.reason = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    return message;
  },

  toJSON(message: WorkflowExecutionTerminatedEventAttributes): unknown {
    const obj: any = {};
    message.reason !== undefined && (obj.reason = message.reason);
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.identity !== undefined && (obj.identity = message.identity);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionTerminatedEventAttributes>,
  ): WorkflowExecutionTerminatedEventAttributes {
    const message = {
      ...baseWorkflowExecutionTerminatedEventAttributes,
    } as WorkflowExecutionTerminatedEventAttributes;
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = object.reason;
    } else {
      message.reason = '';
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    return message;
  },
};

const baseRequestCancelExternalWorkflowExecutionInitiatedEventAttributes: object = {
  workflowTaskCompletedEventId: 0,
  namespace: '',
  control: '',
  childWorkflowOnly: false,
};

export const RequestCancelExternalWorkflowExecutionInitiatedEventAttributes = {
  encode(
    message: RequestCancelExternalWorkflowExecutionInitiatedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(8).int64(message.workflowTaskCompletedEventId);
    }
    if (message.namespace !== '') {
      writer.uint32(18).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.control !== '') {
      writer.uint32(34).string(message.control);
    }
    if (message.childWorkflowOnly === true) {
      writer.uint32(40).bool(message.childWorkflowOnly);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RequestCancelExternalWorkflowExecutionInitiatedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionInitiatedEventAttributes,
    } as RequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 2:
          message.namespace = reader.string();
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.control = reader.string();
          break;
        case 5:
          message.childWorkflowOnly = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(
    object: any,
  ): RequestCancelExternalWorkflowExecutionInitiatedEventAttributes {
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionInitiatedEventAttributes,
    } as RequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    if (
      object.childWorkflowOnly !== undefined &&
      object.childWorkflowOnly !== null
    ) {
      message.childWorkflowOnly = Boolean(object.childWorkflowOnly);
    } else {
      message.childWorkflowOnly = false;
    }
    return message;
  },

  toJSON(
    message: RequestCancelExternalWorkflowExecutionInitiatedEventAttributes,
  ): unknown {
    const obj: any = {};
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.control !== undefined && (obj.control = message.control);
    message.childWorkflowOnly !== undefined &&
      (obj.childWorkflowOnly = message.childWorkflowOnly);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RequestCancelExternalWorkflowExecutionInitiatedEventAttributes>,
  ): RequestCancelExternalWorkflowExecutionInitiatedEventAttributes {
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionInitiatedEventAttributes,
    } as RequestCancelExternalWorkflowExecutionInitiatedEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    if (
      object.childWorkflowOnly !== undefined &&
      object.childWorkflowOnly !== null
    ) {
      message.childWorkflowOnly = object.childWorkflowOnly;
    } else {
      message.childWorkflowOnly = false;
    }
    return message;
  },
};

const baseRequestCancelExternalWorkflowExecutionFailedEventAttributes: object = {
  cause: 0,
  workflowTaskCompletedEventId: 0,
  namespace: '',
  initiatedEventId: 0,
  control: '',
};

export const RequestCancelExternalWorkflowExecutionFailedEventAttributes = {
  encode(
    message: RequestCancelExternalWorkflowExecutionFailedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cause !== 0) {
      writer.uint32(8).int32(message.cause);
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(16).int64(message.workflowTaskCompletedEventId);
    }
    if (message.namespace !== '') {
      writer.uint32(26).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(40).int64(message.initiatedEventId);
    }
    if (message.control !== '') {
      writer.uint32(50).string(message.control);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RequestCancelExternalWorkflowExecutionFailedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionFailedEventAttributes,
    } as RequestCancelExternalWorkflowExecutionFailedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cause = reader.int32() as any;
          break;
        case 2:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 3:
          message.namespace = reader.string();
          break;
        case 4:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.control = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(
    object: any,
  ): RequestCancelExternalWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionFailedEventAttributes,
    } as RequestCancelExternalWorkflowExecutionFailedEventAttributes;
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = cancelExternalWorkflowExecutionFailedCauseFromJSON(
        object.cause,
      );
    } else {
      message.cause = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    return message;
  },

  toJSON(
    message: RequestCancelExternalWorkflowExecutionFailedEventAttributes,
  ): unknown {
    const obj: any = {};
    message.cause !== undefined &&
      (obj.cause = cancelExternalWorkflowExecutionFailedCauseToJSON(
        message.cause,
      ));
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.control !== undefined && (obj.control = message.control);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RequestCancelExternalWorkflowExecutionFailedEventAttributes>,
  ): RequestCancelExternalWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionFailedEventAttributes,
    } as RequestCancelExternalWorkflowExecutionFailedEventAttributes;
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = object.cause;
    } else {
      message.cause = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    return message;
  },
};

const baseExternalWorkflowExecutionCancelRequestedEventAttributes: object = {
  initiatedEventId: 0,
  namespace: '',
};

export const ExternalWorkflowExecutionCancelRequestedEventAttributes = {
  encode(
    message: ExternalWorkflowExecutionCancelRequestedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.initiatedEventId !== 0) {
      writer.uint32(8).int64(message.initiatedEventId);
    }
    if (message.namespace !== '') {
      writer.uint32(18).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ExternalWorkflowExecutionCancelRequestedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseExternalWorkflowExecutionCancelRequestedEventAttributes,
    } as ExternalWorkflowExecutionCancelRequestedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.namespace = reader.string();
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(
    object: any,
  ): ExternalWorkflowExecutionCancelRequestedEventAttributes {
    const message = {
      ...baseExternalWorkflowExecutionCancelRequestedEventAttributes,
    } as ExternalWorkflowExecutionCancelRequestedEventAttributes;
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    return message;
  },

  toJSON(
    message: ExternalWorkflowExecutionCancelRequestedEventAttributes,
  ): unknown {
    const obj: any = {};
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ExternalWorkflowExecutionCancelRequestedEventAttributes>,
  ): ExternalWorkflowExecutionCancelRequestedEventAttributes {
    const message = {
      ...baseExternalWorkflowExecutionCancelRequestedEventAttributes,
    } as ExternalWorkflowExecutionCancelRequestedEventAttributes;
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    return message;
  },
};

const baseSignalExternalWorkflowExecutionInitiatedEventAttributes: object = {
  workflowTaskCompletedEventId: 0,
  namespace: '',
  signalName: '',
  control: '',
  childWorkflowOnly: false,
};

export const SignalExternalWorkflowExecutionInitiatedEventAttributes = {
  encode(
    message: SignalExternalWorkflowExecutionInitiatedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(8).int64(message.workflowTaskCompletedEventId);
    }
    if (message.namespace !== '') {
      writer.uint32(18).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.signalName !== '') {
      writer.uint32(34).string(message.signalName);
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(42).fork()).ldelim();
    }
    if (message.control !== '') {
      writer.uint32(50).string(message.control);
    }
    if (message.childWorkflowOnly === true) {
      writer.uint32(56).bool(message.childWorkflowOnly);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SignalExternalWorkflowExecutionInitiatedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSignalExternalWorkflowExecutionInitiatedEventAttributes,
    } as SignalExternalWorkflowExecutionInitiatedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 2:
          message.namespace = reader.string();
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.signalName = reader.string();
          break;
        case 5:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 6:
          message.control = reader.string();
          break;
        case 7:
          message.childWorkflowOnly = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(
    object: any,
  ): SignalExternalWorkflowExecutionInitiatedEventAttributes {
    const message = {
      ...baseSignalExternalWorkflowExecutionInitiatedEventAttributes,
    } as SignalExternalWorkflowExecutionInitiatedEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = String(object.signalName);
    } else {
      message.signalName = '';
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    if (
      object.childWorkflowOnly !== undefined &&
      object.childWorkflowOnly !== null
    ) {
      message.childWorkflowOnly = Boolean(object.childWorkflowOnly);
    } else {
      message.childWorkflowOnly = false;
    }
    return message;
  },

  toJSON(
    message: SignalExternalWorkflowExecutionInitiatedEventAttributes,
  ): unknown {
    const obj: any = {};
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.signalName !== undefined && (obj.signalName = message.signalName);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.control !== undefined && (obj.control = message.control);
    message.childWorkflowOnly !== undefined &&
      (obj.childWorkflowOnly = message.childWorkflowOnly);
    return obj;
  },

  fromPartial(
    object: DeepPartial<SignalExternalWorkflowExecutionInitiatedEventAttributes>,
  ): SignalExternalWorkflowExecutionInitiatedEventAttributes {
    const message = {
      ...baseSignalExternalWorkflowExecutionInitiatedEventAttributes,
    } as SignalExternalWorkflowExecutionInitiatedEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.signalName !== undefined && object.signalName !== null) {
      message.signalName = object.signalName;
    } else {
      message.signalName = '';
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    if (
      object.childWorkflowOnly !== undefined &&
      object.childWorkflowOnly !== null
    ) {
      message.childWorkflowOnly = object.childWorkflowOnly;
    } else {
      message.childWorkflowOnly = false;
    }
    return message;
  },
};

const baseSignalExternalWorkflowExecutionFailedEventAttributes: object = {
  cause: 0,
  workflowTaskCompletedEventId: 0,
  namespace: '',
  initiatedEventId: 0,
  control: '',
};

export const SignalExternalWorkflowExecutionFailedEventAttributes = {
  encode(
    message: SignalExternalWorkflowExecutionFailedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.cause !== 0) {
      writer.uint32(8).int32(message.cause);
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(16).int64(message.workflowTaskCompletedEventId);
    }
    if (message.namespace !== '') {
      writer.uint32(26).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(40).int64(message.initiatedEventId);
    }
    if (message.control !== '') {
      writer.uint32(50).string(message.control);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SignalExternalWorkflowExecutionFailedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSignalExternalWorkflowExecutionFailedEventAttributes,
    } as SignalExternalWorkflowExecutionFailedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cause = reader.int32() as any;
          break;
        case 2:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 3:
          message.namespace = reader.string();
          break;
        case 4:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.control = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SignalExternalWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseSignalExternalWorkflowExecutionFailedEventAttributes,
    } as SignalExternalWorkflowExecutionFailedEventAttributes;
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = signalExternalWorkflowExecutionFailedCauseFromJSON(
        object.cause,
      );
    } else {
      message.cause = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    return message;
  },

  toJSON(
    message: SignalExternalWorkflowExecutionFailedEventAttributes,
  ): unknown {
    const obj: any = {};
    message.cause !== undefined &&
      (obj.cause = signalExternalWorkflowExecutionFailedCauseToJSON(
        message.cause,
      ));
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.control !== undefined && (obj.control = message.control);
    return obj;
  },

  fromPartial(
    object: DeepPartial<SignalExternalWorkflowExecutionFailedEventAttributes>,
  ): SignalExternalWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseSignalExternalWorkflowExecutionFailedEventAttributes,
    } as SignalExternalWorkflowExecutionFailedEventAttributes;
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = object.cause;
    } else {
      message.cause = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    return message;
  },
};

const baseExternalWorkflowExecutionSignaledEventAttributes: object = {
  initiatedEventId: 0,
  namespace: '',
  control: '',
};

export const ExternalWorkflowExecutionSignaledEventAttributes = {
  encode(
    message: ExternalWorkflowExecutionSignaledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.initiatedEventId !== 0) {
      writer.uint32(8).int64(message.initiatedEventId);
    }
    if (message.namespace !== '') {
      writer.uint32(18).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.control !== '') {
      writer.uint32(34).string(message.control);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ExternalWorkflowExecutionSignaledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseExternalWorkflowExecutionSignaledEventAttributes,
    } as ExternalWorkflowExecutionSignaledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.namespace = reader.string();
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.control = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ExternalWorkflowExecutionSignaledEventAttributes {
    const message = {
      ...baseExternalWorkflowExecutionSignaledEventAttributes,
    } as ExternalWorkflowExecutionSignaledEventAttributes;
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    return message;
  },

  toJSON(message: ExternalWorkflowExecutionSignaledEventAttributes): unknown {
    const obj: any = {};
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.control !== undefined && (obj.control = message.control);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ExternalWorkflowExecutionSignaledEventAttributes>,
  ): ExternalWorkflowExecutionSignaledEventAttributes {
    const message = {
      ...baseExternalWorkflowExecutionSignaledEventAttributes,
    } as ExternalWorkflowExecutionSignaledEventAttributes;
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    return message;
  },
};

const baseUpsertWorkflowSearchAttributesEventAttributes: object = {
  workflowTaskCompletedEventId: 0,
};

export const UpsertWorkflowSearchAttributesEventAttributes = {
  encode(
    message: UpsertWorkflowSearchAttributesEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(8).int64(message.workflowTaskCompletedEventId);
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpsertWorkflowSearchAttributesEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseUpsertWorkflowSearchAttributesEventAttributes,
    } as UpsertWorkflowSearchAttributesEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 2:
          message.searchAttributes = SearchAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpsertWorkflowSearchAttributesEventAttributes {
    const message = {
      ...baseUpsertWorkflowSearchAttributesEventAttributes,
    } as UpsertWorkflowSearchAttributesEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromJSON(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    return message;
  },

  toJSON(message: UpsertWorkflowSearchAttributesEventAttributes): unknown {
    const obj: any = {};
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<UpsertWorkflowSearchAttributesEventAttributes>,
  ): UpsertWorkflowSearchAttributesEventAttributes {
    const message = {
      ...baseUpsertWorkflowSearchAttributesEventAttributes,
    } as UpsertWorkflowSearchAttributesEventAttributes;
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromPartial(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    return message;
  },
};

const baseStartChildWorkflowExecutionInitiatedEventAttributes: object = {
  namespace: '',
  workflowId: '',
  parentClosePolicy: 0,
  control: '',
  workflowTaskCompletedEventId: 0,
  workflowIdReusePolicy: 0,
  cronSchedule: '',
};

export const StartChildWorkflowExecutionInitiatedEventAttributes = {
  encode(
    message: StartChildWorkflowExecutionInitiatedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(34).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(42).fork()).ldelim();
    }
    if (message.workflowExecutionTimeout !== undefined) {
      Duration.encode(
        message.workflowExecutionTimeout,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.workflowRunTimeout !== undefined) {
      Duration.encode(
        message.workflowRunTimeout,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.workflowTaskTimeout !== undefined) {
      Duration.encode(
        message.workflowTaskTimeout,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.parentClosePolicy !== 0) {
      writer.uint32(72).int32(message.parentClosePolicy);
    }
    if (message.control !== '') {
      writer.uint32(82).string(message.control);
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(88).int64(message.workflowTaskCompletedEventId);
    }
    if (message.workflowIdReusePolicy !== 0) {
      writer.uint32(96).int32(message.workflowIdReusePolicy);
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(106).fork(),
      ).ldelim();
    }
    if (message.cronSchedule !== '') {
      writer.uint32(114).string(message.cronSchedule);
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(122).fork()).ldelim();
    }
    if (message.memo !== undefined) {
      Memo.encode(message.memo, writer.uint32(130).fork()).ldelim();
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(138).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): StartChildWorkflowExecutionInitiatedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseStartChildWorkflowExecutionInitiatedEventAttributes,
    } as StartChildWorkflowExecutionInitiatedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 5:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 6:
          message.workflowExecutionTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.workflowRunTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 8:
          message.workflowTaskTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.parentClosePolicy = reader.int32() as any;
          break;
        case 10:
          message.control = reader.string();
          break;
        case 11:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 12:
          message.workflowIdReusePolicy = reader.int32() as any;
          break;
        case 13:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        case 14:
          message.cronSchedule = reader.string();
          break;
        case 15:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 16:
          message.memo = Memo.decode(reader, reader.uint32());
          break;
        case 17:
          message.searchAttributes = SearchAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartChildWorkflowExecutionInitiatedEventAttributes {
    const message = {
      ...baseStartChildWorkflowExecutionInitiatedEventAttributes,
    } as StartChildWorkflowExecutionInitiatedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromJSON(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromJSON(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromJSON(object.workflowRunTimeout);
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromJSON(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (
      object.parentClosePolicy !== undefined &&
      object.parentClosePolicy !== null
    ) {
      message.parentClosePolicy = parentClosePolicyFromJSON(
        object.parentClosePolicy,
      );
    } else {
      message.parentClosePolicy = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (
      object.workflowIdReusePolicy !== undefined &&
      object.workflowIdReusePolicy !== null
    ) {
      message.workflowIdReusePolicy = workflowIdReusePolicyFromJSON(
        object.workflowIdReusePolicy,
      );
    } else {
      message.workflowIdReusePolicy = 0;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = String(object.cronSchedule);
    } else {
      message.cronSchedule = '';
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromJSON(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromJSON(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    return message;
  },

  toJSON(
    message: StartChildWorkflowExecutionInitiatedEventAttributes,
  ): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.input !== undefined &&
      (obj.input = message.input ? Payloads.toJSON(message.input) : undefined);
    message.workflowExecutionTimeout !== undefined &&
      (obj.workflowExecutionTimeout = message.workflowExecutionTimeout
        ? Duration.toJSON(message.workflowExecutionTimeout)
        : undefined);
    message.workflowRunTimeout !== undefined &&
      (obj.workflowRunTimeout = message.workflowRunTimeout
        ? Duration.toJSON(message.workflowRunTimeout)
        : undefined);
    message.workflowTaskTimeout !== undefined &&
      (obj.workflowTaskTimeout = message.workflowTaskTimeout
        ? Duration.toJSON(message.workflowTaskTimeout)
        : undefined);
    message.parentClosePolicy !== undefined &&
      (obj.parentClosePolicy = parentClosePolicyToJSON(
        message.parentClosePolicy,
      ));
    message.control !== undefined && (obj.control = message.control);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    message.workflowIdReusePolicy !== undefined &&
      (obj.workflowIdReusePolicy = workflowIdReusePolicyToJSON(
        message.workflowIdReusePolicy,
      ));
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
        : undefined);
    message.cronSchedule !== undefined &&
      (obj.cronSchedule = message.cronSchedule);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.memo !== undefined &&
      (obj.memo = message.memo ? Memo.toJSON(message.memo) : undefined);
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<StartChildWorkflowExecutionInitiatedEventAttributes>,
  ): StartChildWorkflowExecutionInitiatedEventAttributes {
    const message = {
      ...baseStartChildWorkflowExecutionInitiatedEventAttributes,
    } as StartChildWorkflowExecutionInitiatedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
    }
    if (object.input !== undefined && object.input !== null) {
      message.input = Payloads.fromPartial(object.input);
    } else {
      message.input = undefined;
    }
    if (
      object.workflowExecutionTimeout !== undefined &&
      object.workflowExecutionTimeout !== null
    ) {
      message.workflowExecutionTimeout = Duration.fromPartial(
        object.workflowExecutionTimeout,
      );
    } else {
      message.workflowExecutionTimeout = undefined;
    }
    if (
      object.workflowRunTimeout !== undefined &&
      object.workflowRunTimeout !== null
    ) {
      message.workflowRunTimeout = Duration.fromPartial(
        object.workflowRunTimeout,
      );
    } else {
      message.workflowRunTimeout = undefined;
    }
    if (
      object.workflowTaskTimeout !== undefined &&
      object.workflowTaskTimeout !== null
    ) {
      message.workflowTaskTimeout = Duration.fromPartial(
        object.workflowTaskTimeout,
      );
    } else {
      message.workflowTaskTimeout = undefined;
    }
    if (
      object.parentClosePolicy !== undefined &&
      object.parentClosePolicy !== null
    ) {
      message.parentClosePolicy = object.parentClosePolicy;
    } else {
      message.parentClosePolicy = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    if (
      object.workflowIdReusePolicy !== undefined &&
      object.workflowIdReusePolicy !== null
    ) {
      message.workflowIdReusePolicy = object.workflowIdReusePolicy;
    } else {
      message.workflowIdReusePolicy = 0;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    if (object.cronSchedule !== undefined && object.cronSchedule !== null) {
      message.cronSchedule = object.cronSchedule;
    } else {
      message.cronSchedule = '';
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    if (object.memo !== undefined && object.memo !== null) {
      message.memo = Memo.fromPartial(object.memo);
    } else {
      message.memo = undefined;
    }
    if (
      object.searchAttributes !== undefined &&
      object.searchAttributes !== null
    ) {
      message.searchAttributes = SearchAttributes.fromPartial(
        object.searchAttributes,
      );
    } else {
      message.searchAttributes = undefined;
    }
    return message;
  },
};

const baseStartChildWorkflowExecutionFailedEventAttributes: object = {
  namespace: '',
  workflowId: '',
  cause: 0,
  control: '',
  initiatedEventId: 0,
  workflowTaskCompletedEventId: 0,
};

export const StartChildWorkflowExecutionFailedEventAttributes = {
  encode(
    message: StartChildWorkflowExecutionFailedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.cause !== 0) {
      writer.uint32(32).int32(message.cause);
    }
    if (message.control !== '') {
      writer.uint32(42).string(message.control);
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(48).int64(message.initiatedEventId);
    }
    if (message.workflowTaskCompletedEventId !== 0) {
      writer.uint32(56).int64(message.workflowTaskCompletedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): StartChildWorkflowExecutionFailedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseStartChildWorkflowExecutionFailedEventAttributes,
    } as StartChildWorkflowExecutionFailedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowId = reader.string();
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.cause = reader.int32() as any;
          break;
        case 5:
          message.control = reader.string();
          break;
        case 6:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 7:
          message.workflowTaskCompletedEventId = longToNumber(
            reader.int64() as Long,
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartChildWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseStartChildWorkflowExecutionFailedEventAttributes,
    } as StartChildWorkflowExecutionFailedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = String(object.workflowId);
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = startChildWorkflowExecutionFailedCauseFromJSON(
        object.cause,
      );
    } else {
      message.cause = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = String(object.control);
    } else {
      message.control = '';
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId = Number(
        object.workflowTaskCompletedEventId,
      );
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },

  toJSON(message: StartChildWorkflowExecutionFailedEventAttributes): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.cause !== undefined &&
      (obj.cause = startChildWorkflowExecutionFailedCauseToJSON(message.cause));
    message.control !== undefined && (obj.control = message.control);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.workflowTaskCompletedEventId !== undefined &&
      (obj.workflowTaskCompletedEventId = message.workflowTaskCompletedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<StartChildWorkflowExecutionFailedEventAttributes>,
  ): StartChildWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseStartChildWorkflowExecutionFailedEventAttributes,
    } as StartChildWorkflowExecutionFailedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.workflowId !== undefined && object.workflowId !== null) {
      message.workflowId = object.workflowId;
    } else {
      message.workflowId = '';
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = object.cause;
    } else {
      message.cause = 0;
    }
    if (object.control !== undefined && object.control !== null) {
      message.control = object.control;
    } else {
      message.control = '';
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (
      object.workflowTaskCompletedEventId !== undefined &&
      object.workflowTaskCompletedEventId !== null
    ) {
      message.workflowTaskCompletedEventId =
        object.workflowTaskCompletedEventId;
    } else {
      message.workflowTaskCompletedEventId = 0;
    }
    return message;
  },
};

const baseChildWorkflowExecutionStartedEventAttributes: object = {
  namespace: '',
  initiatedEventId: 0,
};

export const ChildWorkflowExecutionStartedEventAttributes = {
  encode(
    message: ChildWorkflowExecutionStartedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(16).int64(message.initiatedEventId);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ChildWorkflowExecutionStartedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseChildWorkflowExecutionStartedEventAttributes,
    } as ChildWorkflowExecutionStartedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 5:
          message.header = Header.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ChildWorkflowExecutionStartedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionStartedEventAttributes,
    } as ChildWorkflowExecutionStartedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromJSON(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },

  toJSON(message: ChildWorkflowExecutionStartedEventAttributes): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ChildWorkflowExecutionStartedEventAttributes>,
  ): ChildWorkflowExecutionStartedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionStartedEventAttributes,
    } as ChildWorkflowExecutionStartedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (object.header !== undefined && object.header !== null) {
      message.header = Header.fromPartial(object.header);
    } else {
      message.header = undefined;
    }
    return message;
  },
};

const baseChildWorkflowExecutionCompletedEventAttributes: object = {
  namespace: '',
  initiatedEventId: 0,
  startedEventId: 0,
};

export const ChildWorkflowExecutionCompletedEventAttributes = {
  encode(
    message: ChildWorkflowExecutionCompletedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.result !== undefined) {
      Payloads.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    if (message.namespace !== '') {
      writer.uint32(18).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(40).int64(message.initiatedEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(48).int64(message.startedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ChildWorkflowExecutionCompletedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseChildWorkflowExecutionCompletedEventAttributes,
    } as ChildWorkflowExecutionCompletedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.result = Payloads.decode(reader, reader.uint32());
          break;
        case 2:
          message.namespace = reader.string();
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 5:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ChildWorkflowExecutionCompletedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionCompletedEventAttributes,
    } as ChildWorkflowExecutionCompletedEventAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromJSON(object.result);
    } else {
      message.result = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    return message;
  },

  toJSON(message: ChildWorkflowExecutionCompletedEventAttributes): unknown {
    const obj: any = {};
    message.result !== undefined &&
      (obj.result = message.result
        ? Payloads.toJSON(message.result)
        : undefined);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ChildWorkflowExecutionCompletedEventAttributes>,
  ): ChildWorkflowExecutionCompletedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionCompletedEventAttributes,
    } as ChildWorkflowExecutionCompletedEventAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromPartial(object.result);
    } else {
      message.result = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    return message;
  },
};

const baseChildWorkflowExecutionFailedEventAttributes: object = {
  namespace: '',
  initiatedEventId: 0,
  startedEventId: 0,
  retryState: 0,
};

export const ChildWorkflowExecutionFailedEventAttributes = {
  encode(
    message: ChildWorkflowExecutionFailedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(10).fork()).ldelim();
    }
    if (message.namespace !== '') {
      writer.uint32(18).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(40).int64(message.initiatedEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(48).int64(message.startedEventId);
    }
    if (message.retryState !== 0) {
      writer.uint32(56).int32(message.retryState);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ChildWorkflowExecutionFailedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseChildWorkflowExecutionFailedEventAttributes,
    } as ChildWorkflowExecutionFailedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 2:
          message.namespace = reader.string();
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 5:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 7:
          message.retryState = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ChildWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionFailedEventAttributes,
    } as ChildWorkflowExecutionFailedEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = retryStateFromJSON(object.retryState);
    } else {
      message.retryState = 0;
    }
    return message;
  },

  toJSON(message: ChildWorkflowExecutionFailedEventAttributes): unknown {
    const obj: any = {};
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.retryState !== undefined &&
      (obj.retryState = retryStateToJSON(message.retryState));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ChildWorkflowExecutionFailedEventAttributes>,
  ): ChildWorkflowExecutionFailedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionFailedEventAttributes,
    } as ChildWorkflowExecutionFailedEventAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = object.retryState;
    } else {
      message.retryState = 0;
    }
    return message;
  },
};

const baseChildWorkflowExecutionCanceledEventAttributes: object = {
  namespace: '',
  initiatedEventId: 0,
  startedEventId: 0,
};

export const ChildWorkflowExecutionCanceledEventAttributes = {
  encode(
    message: ChildWorkflowExecutionCanceledEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(10).fork()).ldelim();
    }
    if (message.namespace !== '') {
      writer.uint32(18).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(40).int64(message.initiatedEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(48).int64(message.startedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ChildWorkflowExecutionCanceledEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseChildWorkflowExecutionCanceledEventAttributes,
    } as ChildWorkflowExecutionCanceledEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        case 2:
          message.namespace = reader.string();
          break;
        case 3:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 5:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ChildWorkflowExecutionCanceledEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionCanceledEventAttributes,
    } as ChildWorkflowExecutionCanceledEventAttributes;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    return message;
  },

  toJSON(message: ChildWorkflowExecutionCanceledEventAttributes): unknown {
    const obj: any = {};
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ChildWorkflowExecutionCanceledEventAttributes>,
  ): ChildWorkflowExecutionCanceledEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionCanceledEventAttributes,
    } as ChildWorkflowExecutionCanceledEventAttributes;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    return message;
  },
};

const baseChildWorkflowExecutionTimedOutEventAttributes: object = {
  namespace: '',
  initiatedEventId: 0,
  startedEventId: 0,
  retryState: 0,
};

export const ChildWorkflowExecutionTimedOutEventAttributes = {
  encode(
    message: ChildWorkflowExecutionTimedOutEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(32).int64(message.initiatedEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(40).int64(message.startedEventId);
    }
    if (message.retryState !== 0) {
      writer.uint32(48).int32(message.retryState);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ChildWorkflowExecutionTimedOutEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseChildWorkflowExecutionTimedOutEventAttributes,
    } as ChildWorkflowExecutionTimedOutEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.retryState = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ChildWorkflowExecutionTimedOutEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionTimedOutEventAttributes,
    } as ChildWorkflowExecutionTimedOutEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = retryStateFromJSON(object.retryState);
    } else {
      message.retryState = 0;
    }
    return message;
  },

  toJSON(message: ChildWorkflowExecutionTimedOutEventAttributes): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.retryState !== undefined &&
      (obj.retryState = retryStateToJSON(message.retryState));
    return obj;
  },

  fromPartial(
    object: DeepPartial<ChildWorkflowExecutionTimedOutEventAttributes>,
  ): ChildWorkflowExecutionTimedOutEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionTimedOutEventAttributes,
    } as ChildWorkflowExecutionTimedOutEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = object.retryState;
    } else {
      message.retryState = 0;
    }
    return message;
  },
};

const baseChildWorkflowExecutionTerminatedEventAttributes: object = {
  namespace: '',
  initiatedEventId: 0,
  startedEventId: 0,
};

export const ChildWorkflowExecutionTerminatedEventAttributes = {
  encode(
    message: ChildWorkflowExecutionTerminatedEventAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowExecution !== undefined) {
      WorkflowExecution.encode(
        message.workflowExecution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.initiatedEventId !== 0) {
      writer.uint32(32).int64(message.initiatedEventId);
    }
    if (message.startedEventId !== 0) {
      writer.uint32(40).int64(message.startedEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ChildWorkflowExecutionTerminatedEventAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseChildWorkflowExecutionTerminatedEventAttributes,
    } as ChildWorkflowExecutionTerminatedEventAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.workflowExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 4:
          message.initiatedEventId = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.startedEventId = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ChildWorkflowExecutionTerminatedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionTerminatedEventAttributes,
    } as ChildWorkflowExecutionTerminatedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromJSON(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromJSON(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = Number(object.initiatedEventId);
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = Number(object.startedEventId);
    } else {
      message.startedEventId = 0;
    }
    return message;
  },

  toJSON(message: ChildWorkflowExecutionTerminatedEventAttributes): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowExecution !== undefined &&
      (obj.workflowExecution = message.workflowExecution
        ? WorkflowExecution.toJSON(message.workflowExecution)
        : undefined);
    message.workflowType !== undefined &&
      (obj.workflowType = message.workflowType
        ? WorkflowType.toJSON(message.workflowType)
        : undefined);
    message.initiatedEventId !== undefined &&
      (obj.initiatedEventId = message.initiatedEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ChildWorkflowExecutionTerminatedEventAttributes>,
  ): ChildWorkflowExecutionTerminatedEventAttributes {
    const message = {
      ...baseChildWorkflowExecutionTerminatedEventAttributes,
    } as ChildWorkflowExecutionTerminatedEventAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (
      object.workflowExecution !== undefined &&
      object.workflowExecution !== null
    ) {
      message.workflowExecution = WorkflowExecution.fromPartial(
        object.workflowExecution,
      );
    } else {
      message.workflowExecution = undefined;
    }
    if (object.workflowType !== undefined && object.workflowType !== null) {
      message.workflowType = WorkflowType.fromPartial(object.workflowType);
    } else {
      message.workflowType = undefined;
    }
    if (
      object.initiatedEventId !== undefined &&
      object.initiatedEventId !== null
    ) {
      message.initiatedEventId = object.initiatedEventId;
    } else {
      message.initiatedEventId = 0;
    }
    if (object.startedEventId !== undefined && object.startedEventId !== null) {
      message.startedEventId = object.startedEventId;
    } else {
      message.startedEventId = 0;
    }
    return message;
  },
};

const baseHistoryEvent: object = {
  eventId: 0,
  eventType: 0,
  version: 0,
  taskId: 0,
};

export const HistoryEvent = {
  encode(
    message: HistoryEvent,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.eventId !== 0) {
      writer.uint32(8).int64(message.eventId);
    }
    if (message.eventTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.eventTime),
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.eventType !== 0) {
      writer.uint32(24).int32(message.eventType);
    }
    if (message.version !== 0) {
      writer.uint32(32).int64(message.version);
    }
    if (message.taskId !== 0) {
      writer.uint32(40).int64(message.taskId);
    }
    if (message.workflowExecutionStartedEventAttributes !== undefined) {
      WorkflowExecutionStartedEventAttributes.encode(
        message.workflowExecutionStartedEventAttributes,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionCompletedEventAttributes !== undefined) {
      WorkflowExecutionCompletedEventAttributes.encode(
        message.workflowExecutionCompletedEventAttributes,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionFailedEventAttributes !== undefined) {
      WorkflowExecutionFailedEventAttributes.encode(
        message.workflowExecutionFailedEventAttributes,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionTimedOutEventAttributes !== undefined) {
      WorkflowExecutionTimedOutEventAttributes.encode(
        message.workflowExecutionTimedOutEventAttributes,
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.workflowTaskScheduledEventAttributes !== undefined) {
      WorkflowTaskScheduledEventAttributes.encode(
        message.workflowTaskScheduledEventAttributes,
        writer.uint32(82).fork(),
      ).ldelim();
    }
    if (message.workflowTaskStartedEventAttributes !== undefined) {
      WorkflowTaskStartedEventAttributes.encode(
        message.workflowTaskStartedEventAttributes,
        writer.uint32(90).fork(),
      ).ldelim();
    }
    if (message.workflowTaskCompletedEventAttributes !== undefined) {
      WorkflowTaskCompletedEventAttributes.encode(
        message.workflowTaskCompletedEventAttributes,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.workflowTaskTimedOutEventAttributes !== undefined) {
      WorkflowTaskTimedOutEventAttributes.encode(
        message.workflowTaskTimedOutEventAttributes,
        writer.uint32(106).fork(),
      ).ldelim();
    }
    if (message.workflowTaskFailedEventAttributes !== undefined) {
      WorkflowTaskFailedEventAttributes.encode(
        message.workflowTaskFailedEventAttributes,
        writer.uint32(114).fork(),
      ).ldelim();
    }
    if (message.activityTaskScheduledEventAttributes !== undefined) {
      ActivityTaskScheduledEventAttributes.encode(
        message.activityTaskScheduledEventAttributes,
        writer.uint32(122).fork(),
      ).ldelim();
    }
    if (message.activityTaskStartedEventAttributes !== undefined) {
      ActivityTaskStartedEventAttributes.encode(
        message.activityTaskStartedEventAttributes,
        writer.uint32(130).fork(),
      ).ldelim();
    }
    if (message.activityTaskCompletedEventAttributes !== undefined) {
      ActivityTaskCompletedEventAttributes.encode(
        message.activityTaskCompletedEventAttributes,
        writer.uint32(138).fork(),
      ).ldelim();
    }
    if (message.activityTaskFailedEventAttributes !== undefined) {
      ActivityTaskFailedEventAttributes.encode(
        message.activityTaskFailedEventAttributes,
        writer.uint32(146).fork(),
      ).ldelim();
    }
    if (message.activityTaskTimedOutEventAttributes !== undefined) {
      ActivityTaskTimedOutEventAttributes.encode(
        message.activityTaskTimedOutEventAttributes,
        writer.uint32(154).fork(),
      ).ldelim();
    }
    if (message.timerStartedEventAttributes !== undefined) {
      TimerStartedEventAttributes.encode(
        message.timerStartedEventAttributes,
        writer.uint32(162).fork(),
      ).ldelim();
    }
    if (message.timerFiredEventAttributes !== undefined) {
      TimerFiredEventAttributes.encode(
        message.timerFiredEventAttributes,
        writer.uint32(170).fork(),
      ).ldelim();
    }
    if (message.activityTaskCancelRequestedEventAttributes !== undefined) {
      ActivityTaskCancelRequestedEventAttributes.encode(
        message.activityTaskCancelRequestedEventAttributes,
        writer.uint32(178).fork(),
      ).ldelim();
    }
    if (message.activityTaskCanceledEventAttributes !== undefined) {
      ActivityTaskCanceledEventAttributes.encode(
        message.activityTaskCanceledEventAttributes,
        writer.uint32(186).fork(),
      ).ldelim();
    }
    if (message.timerCanceledEventAttributes !== undefined) {
      TimerCanceledEventAttributes.encode(
        message.timerCanceledEventAttributes,
        writer.uint32(194).fork(),
      ).ldelim();
    }
    if (message.markerRecordedEventAttributes !== undefined) {
      MarkerRecordedEventAttributes.encode(
        message.markerRecordedEventAttributes,
        writer.uint32(202).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionSignaledEventAttributes !== undefined) {
      WorkflowExecutionSignaledEventAttributes.encode(
        message.workflowExecutionSignaledEventAttributes,
        writer.uint32(210).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionTerminatedEventAttributes !== undefined) {
      WorkflowExecutionTerminatedEventAttributes.encode(
        message.workflowExecutionTerminatedEventAttributes,
        writer.uint32(218).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionCancelRequestedEventAttributes !== undefined) {
      WorkflowExecutionCancelRequestedEventAttributes.encode(
        message.workflowExecutionCancelRequestedEventAttributes,
        writer.uint32(226).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionCanceledEventAttributes !== undefined) {
      WorkflowExecutionCanceledEventAttributes.encode(
        message.workflowExecutionCanceledEventAttributes,
        writer.uint32(234).fork(),
      ).ldelim();
    }
    if (
      message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes !==
      undefined
    ) {
      RequestCancelExternalWorkflowExecutionInitiatedEventAttributes.encode(
        message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes,
        writer.uint32(242).fork(),
      ).ldelim();
    }
    if (
      message.requestCancelExternalWorkflowExecutionFailedEventAttributes !==
      undefined
    ) {
      RequestCancelExternalWorkflowExecutionFailedEventAttributes.encode(
        message.requestCancelExternalWorkflowExecutionFailedEventAttributes,
        writer.uint32(250).fork(),
      ).ldelim();
    }
    if (
      message.externalWorkflowExecutionCancelRequestedEventAttributes !==
      undefined
    ) {
      ExternalWorkflowExecutionCancelRequestedEventAttributes.encode(
        message.externalWorkflowExecutionCancelRequestedEventAttributes,
        writer.uint32(258).fork(),
      ).ldelim();
    }
    if (message.workflowExecutionContinuedAsNewEventAttributes !== undefined) {
      WorkflowExecutionContinuedAsNewEventAttributes.encode(
        message.workflowExecutionContinuedAsNewEventAttributes,
        writer.uint32(266).fork(),
      ).ldelim();
    }
    if (
      message.startChildWorkflowExecutionInitiatedEventAttributes !== undefined
    ) {
      StartChildWorkflowExecutionInitiatedEventAttributes.encode(
        message.startChildWorkflowExecutionInitiatedEventAttributes,
        writer.uint32(274).fork(),
      ).ldelim();
    }
    if (
      message.startChildWorkflowExecutionFailedEventAttributes !== undefined
    ) {
      StartChildWorkflowExecutionFailedEventAttributes.encode(
        message.startChildWorkflowExecutionFailedEventAttributes,
        writer.uint32(282).fork(),
      ).ldelim();
    }
    if (message.childWorkflowExecutionStartedEventAttributes !== undefined) {
      ChildWorkflowExecutionStartedEventAttributes.encode(
        message.childWorkflowExecutionStartedEventAttributes,
        writer.uint32(290).fork(),
      ).ldelim();
    }
    if (message.childWorkflowExecutionCompletedEventAttributes !== undefined) {
      ChildWorkflowExecutionCompletedEventAttributes.encode(
        message.childWorkflowExecutionCompletedEventAttributes,
        writer.uint32(298).fork(),
      ).ldelim();
    }
    if (message.childWorkflowExecutionFailedEventAttributes !== undefined) {
      ChildWorkflowExecutionFailedEventAttributes.encode(
        message.childWorkflowExecutionFailedEventAttributes,
        writer.uint32(306).fork(),
      ).ldelim();
    }
    if (message.childWorkflowExecutionCanceledEventAttributes !== undefined) {
      ChildWorkflowExecutionCanceledEventAttributes.encode(
        message.childWorkflowExecutionCanceledEventAttributes,
        writer.uint32(314).fork(),
      ).ldelim();
    }
    if (message.childWorkflowExecutionTimedOutEventAttributes !== undefined) {
      ChildWorkflowExecutionTimedOutEventAttributes.encode(
        message.childWorkflowExecutionTimedOutEventAttributes,
        writer.uint32(322).fork(),
      ).ldelim();
    }
    if (message.childWorkflowExecutionTerminatedEventAttributes !== undefined) {
      ChildWorkflowExecutionTerminatedEventAttributes.encode(
        message.childWorkflowExecutionTerminatedEventAttributes,
        writer.uint32(330).fork(),
      ).ldelim();
    }
    if (
      message.signalExternalWorkflowExecutionInitiatedEventAttributes !==
      undefined
    ) {
      SignalExternalWorkflowExecutionInitiatedEventAttributes.encode(
        message.signalExternalWorkflowExecutionInitiatedEventAttributes,
        writer.uint32(338).fork(),
      ).ldelim();
    }
    if (
      message.signalExternalWorkflowExecutionFailedEventAttributes !== undefined
    ) {
      SignalExternalWorkflowExecutionFailedEventAttributes.encode(
        message.signalExternalWorkflowExecutionFailedEventAttributes,
        writer.uint32(346).fork(),
      ).ldelim();
    }
    if (
      message.externalWorkflowExecutionSignaledEventAttributes !== undefined
    ) {
      ExternalWorkflowExecutionSignaledEventAttributes.encode(
        message.externalWorkflowExecutionSignaledEventAttributes,
        writer.uint32(354).fork(),
      ).ldelim();
    }
    if (message.upsertWorkflowSearchAttributesEventAttributes !== undefined) {
      UpsertWorkflowSearchAttributesEventAttributes.encode(
        message.upsertWorkflowSearchAttributesEventAttributes,
        writer.uint32(362).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HistoryEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseHistoryEvent } as HistoryEvent;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.eventId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.eventTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 3:
          message.eventType = reader.int32() as any;
          break;
        case 4:
          message.version = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.taskId = longToNumber(reader.int64() as Long);
          break;
        case 6:
          message.workflowExecutionStartedEventAttributes = WorkflowExecutionStartedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.workflowExecutionCompletedEventAttributes = WorkflowExecutionCompletedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 8:
          message.workflowExecutionFailedEventAttributes = WorkflowExecutionFailedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.workflowExecutionTimedOutEventAttributes = WorkflowExecutionTimedOutEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 10:
          message.workflowTaskScheduledEventAttributes = WorkflowTaskScheduledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 11:
          message.workflowTaskStartedEventAttributes = WorkflowTaskStartedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 12:
          message.workflowTaskCompletedEventAttributes = WorkflowTaskCompletedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 13:
          message.workflowTaskTimedOutEventAttributes = WorkflowTaskTimedOutEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 14:
          message.workflowTaskFailedEventAttributes = WorkflowTaskFailedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 15:
          message.activityTaskScheduledEventAttributes = ActivityTaskScheduledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 16:
          message.activityTaskStartedEventAttributes = ActivityTaskStartedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 17:
          message.activityTaskCompletedEventAttributes = ActivityTaskCompletedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 18:
          message.activityTaskFailedEventAttributes = ActivityTaskFailedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 19:
          message.activityTaskTimedOutEventAttributes = ActivityTaskTimedOutEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 20:
          message.timerStartedEventAttributes = TimerStartedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 21:
          message.timerFiredEventAttributes = TimerFiredEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 22:
          message.activityTaskCancelRequestedEventAttributes = ActivityTaskCancelRequestedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 23:
          message.activityTaskCanceledEventAttributes = ActivityTaskCanceledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 24:
          message.timerCanceledEventAttributes = TimerCanceledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 25:
          message.markerRecordedEventAttributes = MarkerRecordedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 26:
          message.workflowExecutionSignaledEventAttributes = WorkflowExecutionSignaledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 27:
          message.workflowExecutionTerminatedEventAttributes = WorkflowExecutionTerminatedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 28:
          message.workflowExecutionCancelRequestedEventAttributes = WorkflowExecutionCancelRequestedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 29:
          message.workflowExecutionCanceledEventAttributes = WorkflowExecutionCanceledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 30:
          message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes = RequestCancelExternalWorkflowExecutionInitiatedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 31:
          message.requestCancelExternalWorkflowExecutionFailedEventAttributes = RequestCancelExternalWorkflowExecutionFailedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 32:
          message.externalWorkflowExecutionCancelRequestedEventAttributes = ExternalWorkflowExecutionCancelRequestedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 33:
          message.workflowExecutionContinuedAsNewEventAttributes = WorkflowExecutionContinuedAsNewEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 34:
          message.startChildWorkflowExecutionInitiatedEventAttributes = StartChildWorkflowExecutionInitiatedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 35:
          message.startChildWorkflowExecutionFailedEventAttributes = StartChildWorkflowExecutionFailedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 36:
          message.childWorkflowExecutionStartedEventAttributes = ChildWorkflowExecutionStartedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 37:
          message.childWorkflowExecutionCompletedEventAttributes = ChildWorkflowExecutionCompletedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 38:
          message.childWorkflowExecutionFailedEventAttributes = ChildWorkflowExecutionFailedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 39:
          message.childWorkflowExecutionCanceledEventAttributes = ChildWorkflowExecutionCanceledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 40:
          message.childWorkflowExecutionTimedOutEventAttributes = ChildWorkflowExecutionTimedOutEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 41:
          message.childWorkflowExecutionTerminatedEventAttributes = ChildWorkflowExecutionTerminatedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 42:
          message.signalExternalWorkflowExecutionInitiatedEventAttributes = SignalExternalWorkflowExecutionInitiatedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 43:
          message.signalExternalWorkflowExecutionFailedEventAttributes = SignalExternalWorkflowExecutionFailedEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 44:
          message.externalWorkflowExecutionSignaledEventAttributes = ExternalWorkflowExecutionSignaledEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 45:
          message.upsertWorkflowSearchAttributesEventAttributes = UpsertWorkflowSearchAttributesEventAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HistoryEvent {
    const message = { ...baseHistoryEvent } as HistoryEvent;
    if (object.eventId !== undefined && object.eventId !== null) {
      message.eventId = Number(object.eventId);
    } else {
      message.eventId = 0;
    }
    if (object.eventTime !== undefined && object.eventTime !== null) {
      message.eventTime = fromJsonTimestamp(object.eventTime);
    } else {
      message.eventTime = undefined;
    }
    if (object.eventType !== undefined && object.eventType !== null) {
      message.eventType = eventTypeFromJSON(object.eventType);
    } else {
      message.eventType = 0;
    }
    if (object.version !== undefined && object.version !== null) {
      message.version = Number(object.version);
    } else {
      message.version = 0;
    }
    if (object.taskId !== undefined && object.taskId !== null) {
      message.taskId = Number(object.taskId);
    } else {
      message.taskId = 0;
    }
    if (
      object.workflowExecutionStartedEventAttributes !== undefined &&
      object.workflowExecutionStartedEventAttributes !== null
    ) {
      message.workflowExecutionStartedEventAttributes = WorkflowExecutionStartedEventAttributes.fromJSON(
        object.workflowExecutionStartedEventAttributes,
      );
    } else {
      message.workflowExecutionStartedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionCompletedEventAttributes !== undefined &&
      object.workflowExecutionCompletedEventAttributes !== null
    ) {
      message.workflowExecutionCompletedEventAttributes = WorkflowExecutionCompletedEventAttributes.fromJSON(
        object.workflowExecutionCompletedEventAttributes,
      );
    } else {
      message.workflowExecutionCompletedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionFailedEventAttributes !== undefined &&
      object.workflowExecutionFailedEventAttributes !== null
    ) {
      message.workflowExecutionFailedEventAttributes = WorkflowExecutionFailedEventAttributes.fromJSON(
        object.workflowExecutionFailedEventAttributes,
      );
    } else {
      message.workflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionTimedOutEventAttributes !== undefined &&
      object.workflowExecutionTimedOutEventAttributes !== null
    ) {
      message.workflowExecutionTimedOutEventAttributes = WorkflowExecutionTimedOutEventAttributes.fromJSON(
        object.workflowExecutionTimedOutEventAttributes,
      );
    } else {
      message.workflowExecutionTimedOutEventAttributes = undefined;
    }
    if (
      object.workflowTaskScheduledEventAttributes !== undefined &&
      object.workflowTaskScheduledEventAttributes !== null
    ) {
      message.workflowTaskScheduledEventAttributes = WorkflowTaskScheduledEventAttributes.fromJSON(
        object.workflowTaskScheduledEventAttributes,
      );
    } else {
      message.workflowTaskScheduledEventAttributes = undefined;
    }
    if (
      object.workflowTaskStartedEventAttributes !== undefined &&
      object.workflowTaskStartedEventAttributes !== null
    ) {
      message.workflowTaskStartedEventAttributes = WorkflowTaskStartedEventAttributes.fromJSON(
        object.workflowTaskStartedEventAttributes,
      );
    } else {
      message.workflowTaskStartedEventAttributes = undefined;
    }
    if (
      object.workflowTaskCompletedEventAttributes !== undefined &&
      object.workflowTaskCompletedEventAttributes !== null
    ) {
      message.workflowTaskCompletedEventAttributes = WorkflowTaskCompletedEventAttributes.fromJSON(
        object.workflowTaskCompletedEventAttributes,
      );
    } else {
      message.workflowTaskCompletedEventAttributes = undefined;
    }
    if (
      object.workflowTaskTimedOutEventAttributes !== undefined &&
      object.workflowTaskTimedOutEventAttributes !== null
    ) {
      message.workflowTaskTimedOutEventAttributes = WorkflowTaskTimedOutEventAttributes.fromJSON(
        object.workflowTaskTimedOutEventAttributes,
      );
    } else {
      message.workflowTaskTimedOutEventAttributes = undefined;
    }
    if (
      object.workflowTaskFailedEventAttributes !== undefined &&
      object.workflowTaskFailedEventAttributes !== null
    ) {
      message.workflowTaskFailedEventAttributes = WorkflowTaskFailedEventAttributes.fromJSON(
        object.workflowTaskFailedEventAttributes,
      );
    } else {
      message.workflowTaskFailedEventAttributes = undefined;
    }
    if (
      object.activityTaskScheduledEventAttributes !== undefined &&
      object.activityTaskScheduledEventAttributes !== null
    ) {
      message.activityTaskScheduledEventAttributes = ActivityTaskScheduledEventAttributes.fromJSON(
        object.activityTaskScheduledEventAttributes,
      );
    } else {
      message.activityTaskScheduledEventAttributes = undefined;
    }
    if (
      object.activityTaskStartedEventAttributes !== undefined &&
      object.activityTaskStartedEventAttributes !== null
    ) {
      message.activityTaskStartedEventAttributes = ActivityTaskStartedEventAttributes.fromJSON(
        object.activityTaskStartedEventAttributes,
      );
    } else {
      message.activityTaskStartedEventAttributes = undefined;
    }
    if (
      object.activityTaskCompletedEventAttributes !== undefined &&
      object.activityTaskCompletedEventAttributes !== null
    ) {
      message.activityTaskCompletedEventAttributes = ActivityTaskCompletedEventAttributes.fromJSON(
        object.activityTaskCompletedEventAttributes,
      );
    } else {
      message.activityTaskCompletedEventAttributes = undefined;
    }
    if (
      object.activityTaskFailedEventAttributes !== undefined &&
      object.activityTaskFailedEventAttributes !== null
    ) {
      message.activityTaskFailedEventAttributes = ActivityTaskFailedEventAttributes.fromJSON(
        object.activityTaskFailedEventAttributes,
      );
    } else {
      message.activityTaskFailedEventAttributes = undefined;
    }
    if (
      object.activityTaskTimedOutEventAttributes !== undefined &&
      object.activityTaskTimedOutEventAttributes !== null
    ) {
      message.activityTaskTimedOutEventAttributes = ActivityTaskTimedOutEventAttributes.fromJSON(
        object.activityTaskTimedOutEventAttributes,
      );
    } else {
      message.activityTaskTimedOutEventAttributes = undefined;
    }
    if (
      object.timerStartedEventAttributes !== undefined &&
      object.timerStartedEventAttributes !== null
    ) {
      message.timerStartedEventAttributes = TimerStartedEventAttributes.fromJSON(
        object.timerStartedEventAttributes,
      );
    } else {
      message.timerStartedEventAttributes = undefined;
    }
    if (
      object.timerFiredEventAttributes !== undefined &&
      object.timerFiredEventAttributes !== null
    ) {
      message.timerFiredEventAttributes = TimerFiredEventAttributes.fromJSON(
        object.timerFiredEventAttributes,
      );
    } else {
      message.timerFiredEventAttributes = undefined;
    }
    if (
      object.activityTaskCancelRequestedEventAttributes !== undefined &&
      object.activityTaskCancelRequestedEventAttributes !== null
    ) {
      message.activityTaskCancelRequestedEventAttributes = ActivityTaskCancelRequestedEventAttributes.fromJSON(
        object.activityTaskCancelRequestedEventAttributes,
      );
    } else {
      message.activityTaskCancelRequestedEventAttributes = undefined;
    }
    if (
      object.activityTaskCanceledEventAttributes !== undefined &&
      object.activityTaskCanceledEventAttributes !== null
    ) {
      message.activityTaskCanceledEventAttributes = ActivityTaskCanceledEventAttributes.fromJSON(
        object.activityTaskCanceledEventAttributes,
      );
    } else {
      message.activityTaskCanceledEventAttributes = undefined;
    }
    if (
      object.timerCanceledEventAttributes !== undefined &&
      object.timerCanceledEventAttributes !== null
    ) {
      message.timerCanceledEventAttributes = TimerCanceledEventAttributes.fromJSON(
        object.timerCanceledEventAttributes,
      );
    } else {
      message.timerCanceledEventAttributes = undefined;
    }
    if (
      object.markerRecordedEventAttributes !== undefined &&
      object.markerRecordedEventAttributes !== null
    ) {
      message.markerRecordedEventAttributes = MarkerRecordedEventAttributes.fromJSON(
        object.markerRecordedEventAttributes,
      );
    } else {
      message.markerRecordedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionSignaledEventAttributes !== undefined &&
      object.workflowExecutionSignaledEventAttributes !== null
    ) {
      message.workflowExecutionSignaledEventAttributes = WorkflowExecutionSignaledEventAttributes.fromJSON(
        object.workflowExecutionSignaledEventAttributes,
      );
    } else {
      message.workflowExecutionSignaledEventAttributes = undefined;
    }
    if (
      object.workflowExecutionTerminatedEventAttributes !== undefined &&
      object.workflowExecutionTerminatedEventAttributes !== null
    ) {
      message.workflowExecutionTerminatedEventAttributes = WorkflowExecutionTerminatedEventAttributes.fromJSON(
        object.workflowExecutionTerminatedEventAttributes,
      );
    } else {
      message.workflowExecutionTerminatedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionCancelRequestedEventAttributes !== undefined &&
      object.workflowExecutionCancelRequestedEventAttributes !== null
    ) {
      message.workflowExecutionCancelRequestedEventAttributes = WorkflowExecutionCancelRequestedEventAttributes.fromJSON(
        object.workflowExecutionCancelRequestedEventAttributes,
      );
    } else {
      message.workflowExecutionCancelRequestedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionCanceledEventAttributes !== undefined &&
      object.workflowExecutionCanceledEventAttributes !== null
    ) {
      message.workflowExecutionCanceledEventAttributes = WorkflowExecutionCanceledEventAttributes.fromJSON(
        object.workflowExecutionCanceledEventAttributes,
      );
    } else {
      message.workflowExecutionCanceledEventAttributes = undefined;
    }
    if (
      object.requestCancelExternalWorkflowExecutionInitiatedEventAttributes !==
        undefined &&
      object.requestCancelExternalWorkflowExecutionInitiatedEventAttributes !==
        null
    ) {
      message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes = RequestCancelExternalWorkflowExecutionInitiatedEventAttributes.fromJSON(
        object.requestCancelExternalWorkflowExecutionInitiatedEventAttributes,
      );
    } else {
      message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes = undefined;
    }
    if (
      object.requestCancelExternalWorkflowExecutionFailedEventAttributes !==
        undefined &&
      object.requestCancelExternalWorkflowExecutionFailedEventAttributes !==
        null
    ) {
      message.requestCancelExternalWorkflowExecutionFailedEventAttributes = RequestCancelExternalWorkflowExecutionFailedEventAttributes.fromJSON(
        object.requestCancelExternalWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.requestCancelExternalWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.externalWorkflowExecutionCancelRequestedEventAttributes !==
        undefined &&
      object.externalWorkflowExecutionCancelRequestedEventAttributes !== null
    ) {
      message.externalWorkflowExecutionCancelRequestedEventAttributes = ExternalWorkflowExecutionCancelRequestedEventAttributes.fromJSON(
        object.externalWorkflowExecutionCancelRequestedEventAttributes,
      );
    } else {
      message.externalWorkflowExecutionCancelRequestedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionContinuedAsNewEventAttributes !== undefined &&
      object.workflowExecutionContinuedAsNewEventAttributes !== null
    ) {
      message.workflowExecutionContinuedAsNewEventAttributes = WorkflowExecutionContinuedAsNewEventAttributes.fromJSON(
        object.workflowExecutionContinuedAsNewEventAttributes,
      );
    } else {
      message.workflowExecutionContinuedAsNewEventAttributes = undefined;
    }
    if (
      object.startChildWorkflowExecutionInitiatedEventAttributes !==
        undefined &&
      object.startChildWorkflowExecutionInitiatedEventAttributes !== null
    ) {
      message.startChildWorkflowExecutionInitiatedEventAttributes = StartChildWorkflowExecutionInitiatedEventAttributes.fromJSON(
        object.startChildWorkflowExecutionInitiatedEventAttributes,
      );
    } else {
      message.startChildWorkflowExecutionInitiatedEventAttributes = undefined;
    }
    if (
      object.startChildWorkflowExecutionFailedEventAttributes !== undefined &&
      object.startChildWorkflowExecutionFailedEventAttributes !== null
    ) {
      message.startChildWorkflowExecutionFailedEventAttributes = StartChildWorkflowExecutionFailedEventAttributes.fromJSON(
        object.startChildWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.startChildWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionStartedEventAttributes !== undefined &&
      object.childWorkflowExecutionStartedEventAttributes !== null
    ) {
      message.childWorkflowExecutionStartedEventAttributes = ChildWorkflowExecutionStartedEventAttributes.fromJSON(
        object.childWorkflowExecutionStartedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionStartedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionCompletedEventAttributes !== undefined &&
      object.childWorkflowExecutionCompletedEventAttributes !== null
    ) {
      message.childWorkflowExecutionCompletedEventAttributes = ChildWorkflowExecutionCompletedEventAttributes.fromJSON(
        object.childWorkflowExecutionCompletedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionCompletedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionFailedEventAttributes !== undefined &&
      object.childWorkflowExecutionFailedEventAttributes !== null
    ) {
      message.childWorkflowExecutionFailedEventAttributes = ChildWorkflowExecutionFailedEventAttributes.fromJSON(
        object.childWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionCanceledEventAttributes !== undefined &&
      object.childWorkflowExecutionCanceledEventAttributes !== null
    ) {
      message.childWorkflowExecutionCanceledEventAttributes = ChildWorkflowExecutionCanceledEventAttributes.fromJSON(
        object.childWorkflowExecutionCanceledEventAttributes,
      );
    } else {
      message.childWorkflowExecutionCanceledEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionTimedOutEventAttributes !== undefined &&
      object.childWorkflowExecutionTimedOutEventAttributes !== null
    ) {
      message.childWorkflowExecutionTimedOutEventAttributes = ChildWorkflowExecutionTimedOutEventAttributes.fromJSON(
        object.childWorkflowExecutionTimedOutEventAttributes,
      );
    } else {
      message.childWorkflowExecutionTimedOutEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionTerminatedEventAttributes !== undefined &&
      object.childWorkflowExecutionTerminatedEventAttributes !== null
    ) {
      message.childWorkflowExecutionTerminatedEventAttributes = ChildWorkflowExecutionTerminatedEventAttributes.fromJSON(
        object.childWorkflowExecutionTerminatedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionTerminatedEventAttributes = undefined;
    }
    if (
      object.signalExternalWorkflowExecutionInitiatedEventAttributes !==
        undefined &&
      object.signalExternalWorkflowExecutionInitiatedEventAttributes !== null
    ) {
      message.signalExternalWorkflowExecutionInitiatedEventAttributes = SignalExternalWorkflowExecutionInitiatedEventAttributes.fromJSON(
        object.signalExternalWorkflowExecutionInitiatedEventAttributes,
      );
    } else {
      message.signalExternalWorkflowExecutionInitiatedEventAttributes = undefined;
    }
    if (
      object.signalExternalWorkflowExecutionFailedEventAttributes !==
        undefined &&
      object.signalExternalWorkflowExecutionFailedEventAttributes !== null
    ) {
      message.signalExternalWorkflowExecutionFailedEventAttributes = SignalExternalWorkflowExecutionFailedEventAttributes.fromJSON(
        object.signalExternalWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.signalExternalWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.externalWorkflowExecutionSignaledEventAttributes !== undefined &&
      object.externalWorkflowExecutionSignaledEventAttributes !== null
    ) {
      message.externalWorkflowExecutionSignaledEventAttributes = ExternalWorkflowExecutionSignaledEventAttributes.fromJSON(
        object.externalWorkflowExecutionSignaledEventAttributes,
      );
    } else {
      message.externalWorkflowExecutionSignaledEventAttributes = undefined;
    }
    if (
      object.upsertWorkflowSearchAttributesEventAttributes !== undefined &&
      object.upsertWorkflowSearchAttributesEventAttributes !== null
    ) {
      message.upsertWorkflowSearchAttributesEventAttributes = UpsertWorkflowSearchAttributesEventAttributes.fromJSON(
        object.upsertWorkflowSearchAttributesEventAttributes,
      );
    } else {
      message.upsertWorkflowSearchAttributesEventAttributes = undefined;
    }
    return message;
  },

  toJSON(message: HistoryEvent): unknown {
    const obj: any = {};
    message.eventId !== undefined && (obj.eventId = message.eventId);
    message.eventTime !== undefined &&
      (obj.eventTime = message.eventTime.toISOString());
    message.eventType !== undefined &&
      (obj.eventType = eventTypeToJSON(message.eventType));
    message.version !== undefined && (obj.version = message.version);
    message.taskId !== undefined && (obj.taskId = message.taskId);
    message.workflowExecutionStartedEventAttributes !== undefined &&
      (obj.workflowExecutionStartedEventAttributes = message.workflowExecutionStartedEventAttributes
        ? WorkflowExecutionStartedEventAttributes.toJSON(
            message.workflowExecutionStartedEventAttributes,
          )
        : undefined);
    message.workflowExecutionCompletedEventAttributes !== undefined &&
      (obj.workflowExecutionCompletedEventAttributes = message.workflowExecutionCompletedEventAttributes
        ? WorkflowExecutionCompletedEventAttributes.toJSON(
            message.workflowExecutionCompletedEventAttributes,
          )
        : undefined);
    message.workflowExecutionFailedEventAttributes !== undefined &&
      (obj.workflowExecutionFailedEventAttributes = message.workflowExecutionFailedEventAttributes
        ? WorkflowExecutionFailedEventAttributes.toJSON(
            message.workflowExecutionFailedEventAttributes,
          )
        : undefined);
    message.workflowExecutionTimedOutEventAttributes !== undefined &&
      (obj.workflowExecutionTimedOutEventAttributes = message.workflowExecutionTimedOutEventAttributes
        ? WorkflowExecutionTimedOutEventAttributes.toJSON(
            message.workflowExecutionTimedOutEventAttributes,
          )
        : undefined);
    message.workflowTaskScheduledEventAttributes !== undefined &&
      (obj.workflowTaskScheduledEventAttributes = message.workflowTaskScheduledEventAttributes
        ? WorkflowTaskScheduledEventAttributes.toJSON(
            message.workflowTaskScheduledEventAttributes,
          )
        : undefined);
    message.workflowTaskStartedEventAttributes !== undefined &&
      (obj.workflowTaskStartedEventAttributes = message.workflowTaskStartedEventAttributes
        ? WorkflowTaskStartedEventAttributes.toJSON(
            message.workflowTaskStartedEventAttributes,
          )
        : undefined);
    message.workflowTaskCompletedEventAttributes !== undefined &&
      (obj.workflowTaskCompletedEventAttributes = message.workflowTaskCompletedEventAttributes
        ? WorkflowTaskCompletedEventAttributes.toJSON(
            message.workflowTaskCompletedEventAttributes,
          )
        : undefined);
    message.workflowTaskTimedOutEventAttributes !== undefined &&
      (obj.workflowTaskTimedOutEventAttributes = message.workflowTaskTimedOutEventAttributes
        ? WorkflowTaskTimedOutEventAttributes.toJSON(
            message.workflowTaskTimedOutEventAttributes,
          )
        : undefined);
    message.workflowTaskFailedEventAttributes !== undefined &&
      (obj.workflowTaskFailedEventAttributes = message.workflowTaskFailedEventAttributes
        ? WorkflowTaskFailedEventAttributes.toJSON(
            message.workflowTaskFailedEventAttributes,
          )
        : undefined);
    message.activityTaskScheduledEventAttributes !== undefined &&
      (obj.activityTaskScheduledEventAttributes = message.activityTaskScheduledEventAttributes
        ? ActivityTaskScheduledEventAttributes.toJSON(
            message.activityTaskScheduledEventAttributes,
          )
        : undefined);
    message.activityTaskStartedEventAttributes !== undefined &&
      (obj.activityTaskStartedEventAttributes = message.activityTaskStartedEventAttributes
        ? ActivityTaskStartedEventAttributes.toJSON(
            message.activityTaskStartedEventAttributes,
          )
        : undefined);
    message.activityTaskCompletedEventAttributes !== undefined &&
      (obj.activityTaskCompletedEventAttributes = message.activityTaskCompletedEventAttributes
        ? ActivityTaskCompletedEventAttributes.toJSON(
            message.activityTaskCompletedEventAttributes,
          )
        : undefined);
    message.activityTaskFailedEventAttributes !== undefined &&
      (obj.activityTaskFailedEventAttributes = message.activityTaskFailedEventAttributes
        ? ActivityTaskFailedEventAttributes.toJSON(
            message.activityTaskFailedEventAttributes,
          )
        : undefined);
    message.activityTaskTimedOutEventAttributes !== undefined &&
      (obj.activityTaskTimedOutEventAttributes = message.activityTaskTimedOutEventAttributes
        ? ActivityTaskTimedOutEventAttributes.toJSON(
            message.activityTaskTimedOutEventAttributes,
          )
        : undefined);
    message.timerStartedEventAttributes !== undefined &&
      (obj.timerStartedEventAttributes = message.timerStartedEventAttributes
        ? TimerStartedEventAttributes.toJSON(
            message.timerStartedEventAttributes,
          )
        : undefined);
    message.timerFiredEventAttributes !== undefined &&
      (obj.timerFiredEventAttributes = message.timerFiredEventAttributes
        ? TimerFiredEventAttributes.toJSON(message.timerFiredEventAttributes)
        : undefined);
    message.activityTaskCancelRequestedEventAttributes !== undefined &&
      (obj.activityTaskCancelRequestedEventAttributes = message.activityTaskCancelRequestedEventAttributes
        ? ActivityTaskCancelRequestedEventAttributes.toJSON(
            message.activityTaskCancelRequestedEventAttributes,
          )
        : undefined);
    message.activityTaskCanceledEventAttributes !== undefined &&
      (obj.activityTaskCanceledEventAttributes = message.activityTaskCanceledEventAttributes
        ? ActivityTaskCanceledEventAttributes.toJSON(
            message.activityTaskCanceledEventAttributes,
          )
        : undefined);
    message.timerCanceledEventAttributes !== undefined &&
      (obj.timerCanceledEventAttributes = message.timerCanceledEventAttributes
        ? TimerCanceledEventAttributes.toJSON(
            message.timerCanceledEventAttributes,
          )
        : undefined);
    message.markerRecordedEventAttributes !== undefined &&
      (obj.markerRecordedEventAttributes = message.markerRecordedEventAttributes
        ? MarkerRecordedEventAttributes.toJSON(
            message.markerRecordedEventAttributes,
          )
        : undefined);
    message.workflowExecutionSignaledEventAttributes !== undefined &&
      (obj.workflowExecutionSignaledEventAttributes = message.workflowExecutionSignaledEventAttributes
        ? WorkflowExecutionSignaledEventAttributes.toJSON(
            message.workflowExecutionSignaledEventAttributes,
          )
        : undefined);
    message.workflowExecutionTerminatedEventAttributes !== undefined &&
      (obj.workflowExecutionTerminatedEventAttributes = message.workflowExecutionTerminatedEventAttributes
        ? WorkflowExecutionTerminatedEventAttributes.toJSON(
            message.workflowExecutionTerminatedEventAttributes,
          )
        : undefined);
    message.workflowExecutionCancelRequestedEventAttributes !== undefined &&
      (obj.workflowExecutionCancelRequestedEventAttributes = message.workflowExecutionCancelRequestedEventAttributes
        ? WorkflowExecutionCancelRequestedEventAttributes.toJSON(
            message.workflowExecutionCancelRequestedEventAttributes,
          )
        : undefined);
    message.workflowExecutionCanceledEventAttributes !== undefined &&
      (obj.workflowExecutionCanceledEventAttributes = message.workflowExecutionCanceledEventAttributes
        ? WorkflowExecutionCanceledEventAttributes.toJSON(
            message.workflowExecutionCanceledEventAttributes,
          )
        : undefined);
    message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes !==
      undefined &&
      (obj.requestCancelExternalWorkflowExecutionInitiatedEventAttributes = message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes
        ? RequestCancelExternalWorkflowExecutionInitiatedEventAttributes.toJSON(
            message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes,
          )
        : undefined);
    message.requestCancelExternalWorkflowExecutionFailedEventAttributes !==
      undefined &&
      (obj.requestCancelExternalWorkflowExecutionFailedEventAttributes = message.requestCancelExternalWorkflowExecutionFailedEventAttributes
        ? RequestCancelExternalWorkflowExecutionFailedEventAttributes.toJSON(
            message.requestCancelExternalWorkflowExecutionFailedEventAttributes,
          )
        : undefined);
    message.externalWorkflowExecutionCancelRequestedEventAttributes !==
      undefined &&
      (obj.externalWorkflowExecutionCancelRequestedEventAttributes = message.externalWorkflowExecutionCancelRequestedEventAttributes
        ? ExternalWorkflowExecutionCancelRequestedEventAttributes.toJSON(
            message.externalWorkflowExecutionCancelRequestedEventAttributes,
          )
        : undefined);
    message.workflowExecutionContinuedAsNewEventAttributes !== undefined &&
      (obj.workflowExecutionContinuedAsNewEventAttributes = message.workflowExecutionContinuedAsNewEventAttributes
        ? WorkflowExecutionContinuedAsNewEventAttributes.toJSON(
            message.workflowExecutionContinuedAsNewEventAttributes,
          )
        : undefined);
    message.startChildWorkflowExecutionInitiatedEventAttributes !== undefined &&
      (obj.startChildWorkflowExecutionInitiatedEventAttributes = message.startChildWorkflowExecutionInitiatedEventAttributes
        ? StartChildWorkflowExecutionInitiatedEventAttributes.toJSON(
            message.startChildWorkflowExecutionInitiatedEventAttributes,
          )
        : undefined);
    message.startChildWorkflowExecutionFailedEventAttributes !== undefined &&
      (obj.startChildWorkflowExecutionFailedEventAttributes = message.startChildWorkflowExecutionFailedEventAttributes
        ? StartChildWorkflowExecutionFailedEventAttributes.toJSON(
            message.startChildWorkflowExecutionFailedEventAttributes,
          )
        : undefined);
    message.childWorkflowExecutionStartedEventAttributes !== undefined &&
      (obj.childWorkflowExecutionStartedEventAttributes = message.childWorkflowExecutionStartedEventAttributes
        ? ChildWorkflowExecutionStartedEventAttributes.toJSON(
            message.childWorkflowExecutionStartedEventAttributes,
          )
        : undefined);
    message.childWorkflowExecutionCompletedEventAttributes !== undefined &&
      (obj.childWorkflowExecutionCompletedEventAttributes = message.childWorkflowExecutionCompletedEventAttributes
        ? ChildWorkflowExecutionCompletedEventAttributes.toJSON(
            message.childWorkflowExecutionCompletedEventAttributes,
          )
        : undefined);
    message.childWorkflowExecutionFailedEventAttributes !== undefined &&
      (obj.childWorkflowExecutionFailedEventAttributes = message.childWorkflowExecutionFailedEventAttributes
        ? ChildWorkflowExecutionFailedEventAttributes.toJSON(
            message.childWorkflowExecutionFailedEventAttributes,
          )
        : undefined);
    message.childWorkflowExecutionCanceledEventAttributes !== undefined &&
      (obj.childWorkflowExecutionCanceledEventAttributes = message.childWorkflowExecutionCanceledEventAttributes
        ? ChildWorkflowExecutionCanceledEventAttributes.toJSON(
            message.childWorkflowExecutionCanceledEventAttributes,
          )
        : undefined);
    message.childWorkflowExecutionTimedOutEventAttributes !== undefined &&
      (obj.childWorkflowExecutionTimedOutEventAttributes = message.childWorkflowExecutionTimedOutEventAttributes
        ? ChildWorkflowExecutionTimedOutEventAttributes.toJSON(
            message.childWorkflowExecutionTimedOutEventAttributes,
          )
        : undefined);
    message.childWorkflowExecutionTerminatedEventAttributes !== undefined &&
      (obj.childWorkflowExecutionTerminatedEventAttributes = message.childWorkflowExecutionTerminatedEventAttributes
        ? ChildWorkflowExecutionTerminatedEventAttributes.toJSON(
            message.childWorkflowExecutionTerminatedEventAttributes,
          )
        : undefined);
    message.signalExternalWorkflowExecutionInitiatedEventAttributes !==
      undefined &&
      (obj.signalExternalWorkflowExecutionInitiatedEventAttributes = message.signalExternalWorkflowExecutionInitiatedEventAttributes
        ? SignalExternalWorkflowExecutionInitiatedEventAttributes.toJSON(
            message.signalExternalWorkflowExecutionInitiatedEventAttributes,
          )
        : undefined);
    message.signalExternalWorkflowExecutionFailedEventAttributes !==
      undefined &&
      (obj.signalExternalWorkflowExecutionFailedEventAttributes = message.signalExternalWorkflowExecutionFailedEventAttributes
        ? SignalExternalWorkflowExecutionFailedEventAttributes.toJSON(
            message.signalExternalWorkflowExecutionFailedEventAttributes,
          )
        : undefined);
    message.externalWorkflowExecutionSignaledEventAttributes !== undefined &&
      (obj.externalWorkflowExecutionSignaledEventAttributes = message.externalWorkflowExecutionSignaledEventAttributes
        ? ExternalWorkflowExecutionSignaledEventAttributes.toJSON(
            message.externalWorkflowExecutionSignaledEventAttributes,
          )
        : undefined);
    message.upsertWorkflowSearchAttributesEventAttributes !== undefined &&
      (obj.upsertWorkflowSearchAttributesEventAttributes = message.upsertWorkflowSearchAttributesEventAttributes
        ? UpsertWorkflowSearchAttributesEventAttributes.toJSON(
            message.upsertWorkflowSearchAttributesEventAttributes,
          )
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<HistoryEvent>): HistoryEvent {
    const message = { ...baseHistoryEvent } as HistoryEvent;
    if (object.eventId !== undefined && object.eventId !== null) {
      message.eventId = object.eventId;
    } else {
      message.eventId = 0;
    }
    if (object.eventTime !== undefined && object.eventTime !== null) {
      message.eventTime = object.eventTime;
    } else {
      message.eventTime = undefined;
    }
    if (object.eventType !== undefined && object.eventType !== null) {
      message.eventType = object.eventType;
    } else {
      message.eventType = 0;
    }
    if (object.version !== undefined && object.version !== null) {
      message.version = object.version;
    } else {
      message.version = 0;
    }
    if (object.taskId !== undefined && object.taskId !== null) {
      message.taskId = object.taskId;
    } else {
      message.taskId = 0;
    }
    if (
      object.workflowExecutionStartedEventAttributes !== undefined &&
      object.workflowExecutionStartedEventAttributes !== null
    ) {
      message.workflowExecutionStartedEventAttributes = WorkflowExecutionStartedEventAttributes.fromPartial(
        object.workflowExecutionStartedEventAttributes,
      );
    } else {
      message.workflowExecutionStartedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionCompletedEventAttributes !== undefined &&
      object.workflowExecutionCompletedEventAttributes !== null
    ) {
      message.workflowExecutionCompletedEventAttributes = WorkflowExecutionCompletedEventAttributes.fromPartial(
        object.workflowExecutionCompletedEventAttributes,
      );
    } else {
      message.workflowExecutionCompletedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionFailedEventAttributes !== undefined &&
      object.workflowExecutionFailedEventAttributes !== null
    ) {
      message.workflowExecutionFailedEventAttributes = WorkflowExecutionFailedEventAttributes.fromPartial(
        object.workflowExecutionFailedEventAttributes,
      );
    } else {
      message.workflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionTimedOutEventAttributes !== undefined &&
      object.workflowExecutionTimedOutEventAttributes !== null
    ) {
      message.workflowExecutionTimedOutEventAttributes = WorkflowExecutionTimedOutEventAttributes.fromPartial(
        object.workflowExecutionTimedOutEventAttributes,
      );
    } else {
      message.workflowExecutionTimedOutEventAttributes = undefined;
    }
    if (
      object.workflowTaskScheduledEventAttributes !== undefined &&
      object.workflowTaskScheduledEventAttributes !== null
    ) {
      message.workflowTaskScheduledEventAttributes = WorkflowTaskScheduledEventAttributes.fromPartial(
        object.workflowTaskScheduledEventAttributes,
      );
    } else {
      message.workflowTaskScheduledEventAttributes = undefined;
    }
    if (
      object.workflowTaskStartedEventAttributes !== undefined &&
      object.workflowTaskStartedEventAttributes !== null
    ) {
      message.workflowTaskStartedEventAttributes = WorkflowTaskStartedEventAttributes.fromPartial(
        object.workflowTaskStartedEventAttributes,
      );
    } else {
      message.workflowTaskStartedEventAttributes = undefined;
    }
    if (
      object.workflowTaskCompletedEventAttributes !== undefined &&
      object.workflowTaskCompletedEventAttributes !== null
    ) {
      message.workflowTaskCompletedEventAttributes = WorkflowTaskCompletedEventAttributes.fromPartial(
        object.workflowTaskCompletedEventAttributes,
      );
    } else {
      message.workflowTaskCompletedEventAttributes = undefined;
    }
    if (
      object.workflowTaskTimedOutEventAttributes !== undefined &&
      object.workflowTaskTimedOutEventAttributes !== null
    ) {
      message.workflowTaskTimedOutEventAttributes = WorkflowTaskTimedOutEventAttributes.fromPartial(
        object.workflowTaskTimedOutEventAttributes,
      );
    } else {
      message.workflowTaskTimedOutEventAttributes = undefined;
    }
    if (
      object.workflowTaskFailedEventAttributes !== undefined &&
      object.workflowTaskFailedEventAttributes !== null
    ) {
      message.workflowTaskFailedEventAttributes = WorkflowTaskFailedEventAttributes.fromPartial(
        object.workflowTaskFailedEventAttributes,
      );
    } else {
      message.workflowTaskFailedEventAttributes = undefined;
    }
    if (
      object.activityTaskScheduledEventAttributes !== undefined &&
      object.activityTaskScheduledEventAttributes !== null
    ) {
      message.activityTaskScheduledEventAttributes = ActivityTaskScheduledEventAttributes.fromPartial(
        object.activityTaskScheduledEventAttributes,
      );
    } else {
      message.activityTaskScheduledEventAttributes = undefined;
    }
    if (
      object.activityTaskStartedEventAttributes !== undefined &&
      object.activityTaskStartedEventAttributes !== null
    ) {
      message.activityTaskStartedEventAttributes = ActivityTaskStartedEventAttributes.fromPartial(
        object.activityTaskStartedEventAttributes,
      );
    } else {
      message.activityTaskStartedEventAttributes = undefined;
    }
    if (
      object.activityTaskCompletedEventAttributes !== undefined &&
      object.activityTaskCompletedEventAttributes !== null
    ) {
      message.activityTaskCompletedEventAttributes = ActivityTaskCompletedEventAttributes.fromPartial(
        object.activityTaskCompletedEventAttributes,
      );
    } else {
      message.activityTaskCompletedEventAttributes = undefined;
    }
    if (
      object.activityTaskFailedEventAttributes !== undefined &&
      object.activityTaskFailedEventAttributes !== null
    ) {
      message.activityTaskFailedEventAttributes = ActivityTaskFailedEventAttributes.fromPartial(
        object.activityTaskFailedEventAttributes,
      );
    } else {
      message.activityTaskFailedEventAttributes = undefined;
    }
    if (
      object.activityTaskTimedOutEventAttributes !== undefined &&
      object.activityTaskTimedOutEventAttributes !== null
    ) {
      message.activityTaskTimedOutEventAttributes = ActivityTaskTimedOutEventAttributes.fromPartial(
        object.activityTaskTimedOutEventAttributes,
      );
    } else {
      message.activityTaskTimedOutEventAttributes = undefined;
    }
    if (
      object.timerStartedEventAttributes !== undefined &&
      object.timerStartedEventAttributes !== null
    ) {
      message.timerStartedEventAttributes = TimerStartedEventAttributes.fromPartial(
        object.timerStartedEventAttributes,
      );
    } else {
      message.timerStartedEventAttributes = undefined;
    }
    if (
      object.timerFiredEventAttributes !== undefined &&
      object.timerFiredEventAttributes !== null
    ) {
      message.timerFiredEventAttributes = TimerFiredEventAttributes.fromPartial(
        object.timerFiredEventAttributes,
      );
    } else {
      message.timerFiredEventAttributes = undefined;
    }
    if (
      object.activityTaskCancelRequestedEventAttributes !== undefined &&
      object.activityTaskCancelRequestedEventAttributes !== null
    ) {
      message.activityTaskCancelRequestedEventAttributes = ActivityTaskCancelRequestedEventAttributes.fromPartial(
        object.activityTaskCancelRequestedEventAttributes,
      );
    } else {
      message.activityTaskCancelRequestedEventAttributes = undefined;
    }
    if (
      object.activityTaskCanceledEventAttributes !== undefined &&
      object.activityTaskCanceledEventAttributes !== null
    ) {
      message.activityTaskCanceledEventAttributes = ActivityTaskCanceledEventAttributes.fromPartial(
        object.activityTaskCanceledEventAttributes,
      );
    } else {
      message.activityTaskCanceledEventAttributes = undefined;
    }
    if (
      object.timerCanceledEventAttributes !== undefined &&
      object.timerCanceledEventAttributes !== null
    ) {
      message.timerCanceledEventAttributes = TimerCanceledEventAttributes.fromPartial(
        object.timerCanceledEventAttributes,
      );
    } else {
      message.timerCanceledEventAttributes = undefined;
    }
    if (
      object.markerRecordedEventAttributes !== undefined &&
      object.markerRecordedEventAttributes !== null
    ) {
      message.markerRecordedEventAttributes = MarkerRecordedEventAttributes.fromPartial(
        object.markerRecordedEventAttributes,
      );
    } else {
      message.markerRecordedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionSignaledEventAttributes !== undefined &&
      object.workflowExecutionSignaledEventAttributes !== null
    ) {
      message.workflowExecutionSignaledEventAttributes = WorkflowExecutionSignaledEventAttributes.fromPartial(
        object.workflowExecutionSignaledEventAttributes,
      );
    } else {
      message.workflowExecutionSignaledEventAttributes = undefined;
    }
    if (
      object.workflowExecutionTerminatedEventAttributes !== undefined &&
      object.workflowExecutionTerminatedEventAttributes !== null
    ) {
      message.workflowExecutionTerminatedEventAttributes = WorkflowExecutionTerminatedEventAttributes.fromPartial(
        object.workflowExecutionTerminatedEventAttributes,
      );
    } else {
      message.workflowExecutionTerminatedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionCancelRequestedEventAttributes !== undefined &&
      object.workflowExecutionCancelRequestedEventAttributes !== null
    ) {
      message.workflowExecutionCancelRequestedEventAttributes = WorkflowExecutionCancelRequestedEventAttributes.fromPartial(
        object.workflowExecutionCancelRequestedEventAttributes,
      );
    } else {
      message.workflowExecutionCancelRequestedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionCanceledEventAttributes !== undefined &&
      object.workflowExecutionCanceledEventAttributes !== null
    ) {
      message.workflowExecutionCanceledEventAttributes = WorkflowExecutionCanceledEventAttributes.fromPartial(
        object.workflowExecutionCanceledEventAttributes,
      );
    } else {
      message.workflowExecutionCanceledEventAttributes = undefined;
    }
    if (
      object.requestCancelExternalWorkflowExecutionInitiatedEventAttributes !==
        undefined &&
      object.requestCancelExternalWorkflowExecutionInitiatedEventAttributes !==
        null
    ) {
      message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes = RequestCancelExternalWorkflowExecutionInitiatedEventAttributes.fromPartial(
        object.requestCancelExternalWorkflowExecutionInitiatedEventAttributes,
      );
    } else {
      message.requestCancelExternalWorkflowExecutionInitiatedEventAttributes = undefined;
    }
    if (
      object.requestCancelExternalWorkflowExecutionFailedEventAttributes !==
        undefined &&
      object.requestCancelExternalWorkflowExecutionFailedEventAttributes !==
        null
    ) {
      message.requestCancelExternalWorkflowExecutionFailedEventAttributes = RequestCancelExternalWorkflowExecutionFailedEventAttributes.fromPartial(
        object.requestCancelExternalWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.requestCancelExternalWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.externalWorkflowExecutionCancelRequestedEventAttributes !==
        undefined &&
      object.externalWorkflowExecutionCancelRequestedEventAttributes !== null
    ) {
      message.externalWorkflowExecutionCancelRequestedEventAttributes = ExternalWorkflowExecutionCancelRequestedEventAttributes.fromPartial(
        object.externalWorkflowExecutionCancelRequestedEventAttributes,
      );
    } else {
      message.externalWorkflowExecutionCancelRequestedEventAttributes = undefined;
    }
    if (
      object.workflowExecutionContinuedAsNewEventAttributes !== undefined &&
      object.workflowExecutionContinuedAsNewEventAttributes !== null
    ) {
      message.workflowExecutionContinuedAsNewEventAttributes = WorkflowExecutionContinuedAsNewEventAttributes.fromPartial(
        object.workflowExecutionContinuedAsNewEventAttributes,
      );
    } else {
      message.workflowExecutionContinuedAsNewEventAttributes = undefined;
    }
    if (
      object.startChildWorkflowExecutionInitiatedEventAttributes !==
        undefined &&
      object.startChildWorkflowExecutionInitiatedEventAttributes !== null
    ) {
      message.startChildWorkflowExecutionInitiatedEventAttributes = StartChildWorkflowExecutionInitiatedEventAttributes.fromPartial(
        object.startChildWorkflowExecutionInitiatedEventAttributes,
      );
    } else {
      message.startChildWorkflowExecutionInitiatedEventAttributes = undefined;
    }
    if (
      object.startChildWorkflowExecutionFailedEventAttributes !== undefined &&
      object.startChildWorkflowExecutionFailedEventAttributes !== null
    ) {
      message.startChildWorkflowExecutionFailedEventAttributes = StartChildWorkflowExecutionFailedEventAttributes.fromPartial(
        object.startChildWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.startChildWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionStartedEventAttributes !== undefined &&
      object.childWorkflowExecutionStartedEventAttributes !== null
    ) {
      message.childWorkflowExecutionStartedEventAttributes = ChildWorkflowExecutionStartedEventAttributes.fromPartial(
        object.childWorkflowExecutionStartedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionStartedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionCompletedEventAttributes !== undefined &&
      object.childWorkflowExecutionCompletedEventAttributes !== null
    ) {
      message.childWorkflowExecutionCompletedEventAttributes = ChildWorkflowExecutionCompletedEventAttributes.fromPartial(
        object.childWorkflowExecutionCompletedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionCompletedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionFailedEventAttributes !== undefined &&
      object.childWorkflowExecutionFailedEventAttributes !== null
    ) {
      message.childWorkflowExecutionFailedEventAttributes = ChildWorkflowExecutionFailedEventAttributes.fromPartial(
        object.childWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionCanceledEventAttributes !== undefined &&
      object.childWorkflowExecutionCanceledEventAttributes !== null
    ) {
      message.childWorkflowExecutionCanceledEventAttributes = ChildWorkflowExecutionCanceledEventAttributes.fromPartial(
        object.childWorkflowExecutionCanceledEventAttributes,
      );
    } else {
      message.childWorkflowExecutionCanceledEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionTimedOutEventAttributes !== undefined &&
      object.childWorkflowExecutionTimedOutEventAttributes !== null
    ) {
      message.childWorkflowExecutionTimedOutEventAttributes = ChildWorkflowExecutionTimedOutEventAttributes.fromPartial(
        object.childWorkflowExecutionTimedOutEventAttributes,
      );
    } else {
      message.childWorkflowExecutionTimedOutEventAttributes = undefined;
    }
    if (
      object.childWorkflowExecutionTerminatedEventAttributes !== undefined &&
      object.childWorkflowExecutionTerminatedEventAttributes !== null
    ) {
      message.childWorkflowExecutionTerminatedEventAttributes = ChildWorkflowExecutionTerminatedEventAttributes.fromPartial(
        object.childWorkflowExecutionTerminatedEventAttributes,
      );
    } else {
      message.childWorkflowExecutionTerminatedEventAttributes = undefined;
    }
    if (
      object.signalExternalWorkflowExecutionInitiatedEventAttributes !==
        undefined &&
      object.signalExternalWorkflowExecutionInitiatedEventAttributes !== null
    ) {
      message.signalExternalWorkflowExecutionInitiatedEventAttributes = SignalExternalWorkflowExecutionInitiatedEventAttributes.fromPartial(
        object.signalExternalWorkflowExecutionInitiatedEventAttributes,
      );
    } else {
      message.signalExternalWorkflowExecutionInitiatedEventAttributes = undefined;
    }
    if (
      object.signalExternalWorkflowExecutionFailedEventAttributes !==
        undefined &&
      object.signalExternalWorkflowExecutionFailedEventAttributes !== null
    ) {
      message.signalExternalWorkflowExecutionFailedEventAttributes = SignalExternalWorkflowExecutionFailedEventAttributes.fromPartial(
        object.signalExternalWorkflowExecutionFailedEventAttributes,
      );
    } else {
      message.signalExternalWorkflowExecutionFailedEventAttributes = undefined;
    }
    if (
      object.externalWorkflowExecutionSignaledEventAttributes !== undefined &&
      object.externalWorkflowExecutionSignaledEventAttributes !== null
    ) {
      message.externalWorkflowExecutionSignaledEventAttributes = ExternalWorkflowExecutionSignaledEventAttributes.fromPartial(
        object.externalWorkflowExecutionSignaledEventAttributes,
      );
    } else {
      message.externalWorkflowExecutionSignaledEventAttributes = undefined;
    }
    if (
      object.upsertWorkflowSearchAttributesEventAttributes !== undefined &&
      object.upsertWorkflowSearchAttributesEventAttributes !== null
    ) {
      message.upsertWorkflowSearchAttributesEventAttributes = UpsertWorkflowSearchAttributesEventAttributes.fromPartial(
        object.upsertWorkflowSearchAttributesEventAttributes,
      );
    } else {
      message.upsertWorkflowSearchAttributesEventAttributes = undefined;
    }
    return message;
  },
};

const baseHistory: object = {};

export const History = {
  encode(
    message: History,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.events) {
      HistoryEvent.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): History {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseHistory } as History;
    message.events = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.events.push(HistoryEvent.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): History {
    const message = { ...baseHistory } as History;
    message.events = [];
    if (object.events !== undefined && object.events !== null) {
      for (const e of object.events) {
        message.events.push(HistoryEvent.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: History): unknown {
    const obj: any = {};
    if (message.events) {
      obj.events = message.events.map((e) =>
        e ? HistoryEvent.toJSON(e) : undefined,
      );
    } else {
      obj.events = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<History>): History {
    const message = { ...baseHistory } as History;
    message.events = [];
    if (object.events !== undefined && object.events !== null) {
      for (const e of object.events) {
        message.events.push(HistoryEvent.fromPartial(e));
      }
    }
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  throw 'Unable to locate global object';
})();

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === 'string') {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
