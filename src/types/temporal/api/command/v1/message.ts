/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  ContinueAsNewInitiator,
  ParentClosePolicy,
  WorkflowIdReusePolicy,
  continueAsNewInitiatorFromJSON,
  continueAsNewInitiatorToJSON,
  parentClosePolicyFromJSON,
  workflowIdReusePolicyFromJSON,
  parentClosePolicyToJSON,
  workflowIdReusePolicyToJSON,
} from '../../../../temporal/api/enums/v1/workflow';
import {
  CommandType,
  commandTypeFromJSON,
  commandTypeToJSON,
} from '../../../../temporal/api/enums/v1/command_type';
import {
  ActivityType,
  Header,
  Payloads,
  RetryPolicy,
  WorkflowExecution,
  SearchAttributes,
  WorkflowType,
  Memo,
} from '../../../../temporal/api/common/v1/message';
import { TaskQueue } from '../../../../temporal/api/taskqueue/v1/message';
import { Duration } from '../../../../google/protobuf/duration';
import { Failure } from '../../../../temporal/api/failure/v1/message';

export const protobufPackage = 'temporal.api.command.v1';

export interface ScheduleActivityTaskCommandAttributes {
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
   * When not specified defaults to the workflow execution timeout.
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
  /**
   * Activities are provided by a default retry policy controlled through the service dynamic configuration.
   * Retries are happening up to schedule_to_close_timeout.
   * To disable retries set retry_policy.maximum_attempts to 1.
   */
  retryPolicy: RetryPolicy | undefined;
}

export interface RequestCancelActivityTaskCommandAttributes {
  scheduledEventId: number;
}

export interface StartTimerCommandAttributes {
  timerId: string;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  startToFireTimeout: Duration | undefined;
}

export interface CompleteWorkflowExecutionCommandAttributes {
  result: Payloads | undefined;
}

export interface FailWorkflowExecutionCommandAttributes {
  failure: Failure | undefined;
}

export interface CancelTimerCommandAttributes {
  timerId: string;
}

export interface CancelWorkflowExecutionCommandAttributes {
  details: Payloads | undefined;
}

export interface RequestCancelExternalWorkflowExecutionCommandAttributes {
  namespace: string;
  workflowId: string;
  runId: string;
  control: string;
  childWorkflowOnly: boolean;
}

export interface SignalExternalWorkflowExecutionCommandAttributes {
  namespace: string;
  execution: WorkflowExecution | undefined;
  signalName: string;
  input: Payloads | undefined;
  control: string;
  childWorkflowOnly: boolean;
}

export interface UpsertWorkflowSearchAttributesCommandAttributes {
  searchAttributes: SearchAttributes | undefined;
}

export interface RecordMarkerCommandAttributes {
  markerName: string;
  details: { [key: string]: Payloads };
  header: Header | undefined;
  failure: Failure | undefined;
}

export interface RecordMarkerCommandAttributes_DetailsEntry {
  key: string;
  value: Payloads | undefined;
}

export interface ContinueAsNewWorkflowExecutionCommandAttributes {
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
  backoffStartInterval: Duration | undefined;
  retryPolicy: RetryPolicy | undefined;
  initiator: ContinueAsNewInitiator;
  failure: Failure | undefined;
  lastCompletionResult: Payloads | undefined;
  cronSchedule: string;
  header: Header | undefined;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
}

export interface StartChildWorkflowExecutionCommandAttributes {
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
  /** Default: WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE. */
  workflowIdReusePolicy: WorkflowIdReusePolicy;
  retryPolicy: RetryPolicy | undefined;
  cronSchedule: string;
  header: Header | undefined;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
}

export interface Command {
  commandType: CommandType;
  scheduleActivityTaskCommandAttributes:
    | ScheduleActivityTaskCommandAttributes
    | undefined;
  startTimerCommandAttributes: StartTimerCommandAttributes | undefined;
  completeWorkflowExecutionCommandAttributes:
    | CompleteWorkflowExecutionCommandAttributes
    | undefined;
  failWorkflowExecutionCommandAttributes:
    | FailWorkflowExecutionCommandAttributes
    | undefined;
  requestCancelActivityTaskCommandAttributes:
    | RequestCancelActivityTaskCommandAttributes
    | undefined;
  cancelTimerCommandAttributes: CancelTimerCommandAttributes | undefined;
  cancelWorkflowExecutionCommandAttributes:
    | CancelWorkflowExecutionCommandAttributes
    | undefined;
  requestCancelExternalWorkflowExecutionCommandAttributes:
    | RequestCancelExternalWorkflowExecutionCommandAttributes
    | undefined;
  recordMarkerCommandAttributes: RecordMarkerCommandAttributes | undefined;
  continueAsNewWorkflowExecutionCommandAttributes:
    | ContinueAsNewWorkflowExecutionCommandAttributes
    | undefined;
  startChildWorkflowExecutionCommandAttributes:
    | StartChildWorkflowExecutionCommandAttributes
    | undefined;
  signalExternalWorkflowExecutionCommandAttributes:
    | SignalExternalWorkflowExecutionCommandAttributes
    | undefined;
  upsertWorkflowSearchAttributesCommandAttributes:
    | UpsertWorkflowSearchAttributesCommandAttributes
    | undefined;
}

const baseScheduleActivityTaskCommandAttributes: object = {
  activityId: '',
  namespace: '',
};

export const ScheduleActivityTaskCommandAttributes = {
  encode(
    message: ScheduleActivityTaskCommandAttributes,
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
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(90).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ScheduleActivityTaskCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseScheduleActivityTaskCommandAttributes,
    } as ScheduleActivityTaskCommandAttributes;
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
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ScheduleActivityTaskCommandAttributes {
    const message = {
      ...baseScheduleActivityTaskCommandAttributes,
    } as ScheduleActivityTaskCommandAttributes;
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
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    return message;
  },

  toJSON(message: ScheduleActivityTaskCommandAttributes): unknown {
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
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ScheduleActivityTaskCommandAttributes>,
  ): ScheduleActivityTaskCommandAttributes {
    const message = {
      ...baseScheduleActivityTaskCommandAttributes,
    } as ScheduleActivityTaskCommandAttributes;
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
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
    }
    return message;
  },
};

const baseRequestCancelActivityTaskCommandAttributes: object = {
  scheduledEventId: 0,
};

export const RequestCancelActivityTaskCommandAttributes = {
  encode(
    message: RequestCancelActivityTaskCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.scheduledEventId !== 0) {
      writer.uint32(8).int64(message.scheduledEventId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RequestCancelActivityTaskCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRequestCancelActivityTaskCommandAttributes,
    } as RequestCancelActivityTaskCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledEventId = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RequestCancelActivityTaskCommandAttributes {
    const message = {
      ...baseRequestCancelActivityTaskCommandAttributes,
    } as RequestCancelActivityTaskCommandAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = Number(object.scheduledEventId);
    } else {
      message.scheduledEventId = 0;
    }
    return message;
  },

  toJSON(message: RequestCancelActivityTaskCommandAttributes): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RequestCancelActivityTaskCommandAttributes>,
  ): RequestCancelActivityTaskCommandAttributes {
    const message = {
      ...baseRequestCancelActivityTaskCommandAttributes,
    } as RequestCancelActivityTaskCommandAttributes;
    if (
      object.scheduledEventId !== undefined &&
      object.scheduledEventId !== null
    ) {
      message.scheduledEventId = object.scheduledEventId;
    } else {
      message.scheduledEventId = 0;
    }
    return message;
  },
};

const baseStartTimerCommandAttributes: object = { timerId: '' };

export const StartTimerCommandAttributes = {
  encode(
    message: StartTimerCommandAttributes,
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
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): StartTimerCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseStartTimerCommandAttributes,
    } as StartTimerCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timerId = reader.string();
          break;
        case 2:
          message.startToFireTimeout = Duration.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartTimerCommandAttributes {
    const message = {
      ...baseStartTimerCommandAttributes,
    } as StartTimerCommandAttributes;
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
    return message;
  },

  toJSON(message: StartTimerCommandAttributes): unknown {
    const obj: any = {};
    message.timerId !== undefined && (obj.timerId = message.timerId);
    message.startToFireTimeout !== undefined &&
      (obj.startToFireTimeout = message.startToFireTimeout
        ? Duration.toJSON(message.startToFireTimeout)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<StartTimerCommandAttributes>,
  ): StartTimerCommandAttributes {
    const message = {
      ...baseStartTimerCommandAttributes,
    } as StartTimerCommandAttributes;
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
    return message;
  },
};

const baseCompleteWorkflowExecutionCommandAttributes: object = {};

export const CompleteWorkflowExecutionCommandAttributes = {
  encode(
    message: CompleteWorkflowExecutionCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.result !== undefined) {
      Payloads.encode(message.result, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CompleteWorkflowExecutionCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseCompleteWorkflowExecutionCommandAttributes,
    } as CompleteWorkflowExecutionCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.result = Payloads.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CompleteWorkflowExecutionCommandAttributes {
    const message = {
      ...baseCompleteWorkflowExecutionCommandAttributes,
    } as CompleteWorkflowExecutionCommandAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromJSON(object.result);
    } else {
      message.result = undefined;
    }
    return message;
  },

  toJSON(message: CompleteWorkflowExecutionCommandAttributes): unknown {
    const obj: any = {};
    message.result !== undefined &&
      (obj.result = message.result
        ? Payloads.toJSON(message.result)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<CompleteWorkflowExecutionCommandAttributes>,
  ): CompleteWorkflowExecutionCommandAttributes {
    const message = {
      ...baseCompleteWorkflowExecutionCommandAttributes,
    } as CompleteWorkflowExecutionCommandAttributes;
    if (object.result !== undefined && object.result !== null) {
      message.result = Payloads.fromPartial(object.result);
    } else {
      message.result = undefined;
    }
    return message;
  },
};

const baseFailWorkflowExecutionCommandAttributes: object = {};

export const FailWorkflowExecutionCommandAttributes = {
  encode(
    message: FailWorkflowExecutionCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): FailWorkflowExecutionCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseFailWorkflowExecutionCommandAttributes,
    } as FailWorkflowExecutionCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FailWorkflowExecutionCommandAttributes {
    const message = {
      ...baseFailWorkflowExecutionCommandAttributes,
    } as FailWorkflowExecutionCommandAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromJSON(object.failure);
    } else {
      message.failure = undefined;
    }
    return message;
  },

  toJSON(message: FailWorkflowExecutionCommandAttributes): unknown {
    const obj: any = {};
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<FailWorkflowExecutionCommandAttributes>,
  ): FailWorkflowExecutionCommandAttributes {
    const message = {
      ...baseFailWorkflowExecutionCommandAttributes,
    } as FailWorkflowExecutionCommandAttributes;
    if (object.failure !== undefined && object.failure !== null) {
      message.failure = Failure.fromPartial(object.failure);
    } else {
      message.failure = undefined;
    }
    return message;
  },
};

const baseCancelTimerCommandAttributes: object = { timerId: '' };

export const CancelTimerCommandAttributes = {
  encode(
    message: CancelTimerCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.timerId !== '') {
      writer.uint32(10).string(message.timerId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CancelTimerCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseCancelTimerCommandAttributes,
    } as CancelTimerCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timerId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CancelTimerCommandAttributes {
    const message = {
      ...baseCancelTimerCommandAttributes,
    } as CancelTimerCommandAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = String(object.timerId);
    } else {
      message.timerId = '';
    }
    return message;
  },

  toJSON(message: CancelTimerCommandAttributes): unknown {
    const obj: any = {};
    message.timerId !== undefined && (obj.timerId = message.timerId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<CancelTimerCommandAttributes>,
  ): CancelTimerCommandAttributes {
    const message = {
      ...baseCancelTimerCommandAttributes,
    } as CancelTimerCommandAttributes;
    if (object.timerId !== undefined && object.timerId !== null) {
      message.timerId = object.timerId;
    } else {
      message.timerId = '';
    }
    return message;
  },
};

const baseCancelWorkflowExecutionCommandAttributes: object = {};

export const CancelWorkflowExecutionCommandAttributes = {
  encode(
    message: CancelWorkflowExecutionCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CancelWorkflowExecutionCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseCancelWorkflowExecutionCommandAttributes,
    } as CancelWorkflowExecutionCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CancelWorkflowExecutionCommandAttributes {
    const message = {
      ...baseCancelWorkflowExecutionCommandAttributes,
    } as CancelWorkflowExecutionCommandAttributes;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },

  toJSON(message: CancelWorkflowExecutionCommandAttributes): unknown {
    const obj: any = {};
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<CancelWorkflowExecutionCommandAttributes>,
  ): CancelWorkflowExecutionCommandAttributes {
    const message = {
      ...baseCancelWorkflowExecutionCommandAttributes,
    } as CancelWorkflowExecutionCommandAttributes;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },
};

const baseRequestCancelExternalWorkflowExecutionCommandAttributes: object = {
  namespace: '',
  workflowId: '',
  runId: '',
  control: '',
  childWorkflowOnly: false,
};

export const RequestCancelExternalWorkflowExecutionCommandAttributes = {
  encode(
    message: RequestCancelExternalWorkflowExecutionCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.workflowId !== '') {
      writer.uint32(18).string(message.workflowId);
    }
    if (message.runId !== '') {
      writer.uint32(26).string(message.runId);
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
  ): RequestCancelExternalWorkflowExecutionCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionCommandAttributes,
    } as RequestCancelExternalWorkflowExecutionCommandAttributes;
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
          message.runId = reader.string();
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
  ): RequestCancelExternalWorkflowExecutionCommandAttributes {
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionCommandAttributes,
    } as RequestCancelExternalWorkflowExecutionCommandAttributes;
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
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
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
    message: RequestCancelExternalWorkflowExecutionCommandAttributes,
  ): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    message.control !== undefined && (obj.control = message.control);
    message.childWorkflowOnly !== undefined &&
      (obj.childWorkflowOnly = message.childWorkflowOnly);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RequestCancelExternalWorkflowExecutionCommandAttributes>,
  ): RequestCancelExternalWorkflowExecutionCommandAttributes {
    const message = {
      ...baseRequestCancelExternalWorkflowExecutionCommandAttributes,
    } as RequestCancelExternalWorkflowExecutionCommandAttributes;
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
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
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

const baseSignalExternalWorkflowExecutionCommandAttributes: object = {
  namespace: '',
  signalName: '',
  control: '',
  childWorkflowOnly: false,
};

export const SignalExternalWorkflowExecutionCommandAttributes = {
  encode(
    message: SignalExternalWorkflowExecutionCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.execution !== undefined) {
      WorkflowExecution.encode(
        message.execution,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.signalName !== '') {
      writer.uint32(26).string(message.signalName);
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(34).fork()).ldelim();
    }
    if (message.control !== '') {
      writer.uint32(42).string(message.control);
    }
    if (message.childWorkflowOnly === true) {
      writer.uint32(48).bool(message.childWorkflowOnly);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SignalExternalWorkflowExecutionCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSignalExternalWorkflowExecutionCommandAttributes,
    } as SignalExternalWorkflowExecutionCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.execution = WorkflowExecution.decode(reader, reader.uint32());
          break;
        case 3:
          message.signalName = reader.string();
          break;
        case 4:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 5:
          message.control = reader.string();
          break;
        case 6:
          message.childWorkflowOnly = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SignalExternalWorkflowExecutionCommandAttributes {
    const message = {
      ...baseSignalExternalWorkflowExecutionCommandAttributes,
    } as SignalExternalWorkflowExecutionCommandAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromJSON(object.execution);
    } else {
      message.execution = undefined;
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

  toJSON(message: SignalExternalWorkflowExecutionCommandAttributes): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.execution !== undefined &&
      (obj.execution = message.execution
        ? WorkflowExecution.toJSON(message.execution)
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
    object: DeepPartial<SignalExternalWorkflowExecutionCommandAttributes>,
  ): SignalExternalWorkflowExecutionCommandAttributes {
    const message = {
      ...baseSignalExternalWorkflowExecutionCommandAttributes,
    } as SignalExternalWorkflowExecutionCommandAttributes;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromPartial(object.execution);
    } else {
      message.execution = undefined;
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

const baseUpsertWorkflowSearchAttributesCommandAttributes: object = {};

export const UpsertWorkflowSearchAttributesCommandAttributes = {
  encode(
    message: UpsertWorkflowSearchAttributesCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpsertWorkflowSearchAttributesCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseUpsertWorkflowSearchAttributesCommandAttributes,
    } as UpsertWorkflowSearchAttributesCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
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

  fromJSON(object: any): UpsertWorkflowSearchAttributesCommandAttributes {
    const message = {
      ...baseUpsertWorkflowSearchAttributesCommandAttributes,
    } as UpsertWorkflowSearchAttributesCommandAttributes;
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

  toJSON(message: UpsertWorkflowSearchAttributesCommandAttributes): unknown {
    const obj: any = {};
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<UpsertWorkflowSearchAttributesCommandAttributes>,
  ): UpsertWorkflowSearchAttributesCommandAttributes {
    const message = {
      ...baseUpsertWorkflowSearchAttributesCommandAttributes,
    } as UpsertWorkflowSearchAttributesCommandAttributes;
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

const baseRecordMarkerCommandAttributes: object = { markerName: '' };

export const RecordMarkerCommandAttributes = {
  encode(
    message: RecordMarkerCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.markerName !== '') {
      writer.uint32(10).string(message.markerName);
    }
    Object.entries(message.details).forEach(([key, value]) => {
      RecordMarkerCommandAttributes_DetailsEntry.encode(
        { key: key as any, value },
        writer.uint32(18).fork(),
      ).ldelim();
    });
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(26).fork()).ldelim();
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RecordMarkerCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRecordMarkerCommandAttributes,
    } as RecordMarkerCommandAttributes;
    message.details = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.markerName = reader.string();
          break;
        case 2:
          const entry2 = RecordMarkerCommandAttributes_DetailsEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry2.value !== undefined) {
            message.details[entry2.key] = entry2.value;
          }
          break;
        case 3:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 4:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RecordMarkerCommandAttributes {
    const message = {
      ...baseRecordMarkerCommandAttributes,
    } as RecordMarkerCommandAttributes;
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

  toJSON(message: RecordMarkerCommandAttributes): unknown {
    const obj: any = {};
    message.markerName !== undefined && (obj.markerName = message.markerName);
    obj.details = {};
    if (message.details) {
      Object.entries(message.details).forEach(([k, v]) => {
        obj.details[k] = Payloads.toJSON(v);
      });
    }
    message.header !== undefined &&
      (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.failure !== undefined &&
      (obj.failure = message.failure
        ? Failure.toJSON(message.failure)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RecordMarkerCommandAttributes>,
  ): RecordMarkerCommandAttributes {
    const message = {
      ...baseRecordMarkerCommandAttributes,
    } as RecordMarkerCommandAttributes;
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

const baseRecordMarkerCommandAttributes_DetailsEntry: object = { key: '' };

export const RecordMarkerCommandAttributes_DetailsEntry = {
  encode(
    message: RecordMarkerCommandAttributes_DetailsEntry,
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
  ): RecordMarkerCommandAttributes_DetailsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseRecordMarkerCommandAttributes_DetailsEntry,
    } as RecordMarkerCommandAttributes_DetailsEntry;
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

  fromJSON(object: any): RecordMarkerCommandAttributes_DetailsEntry {
    const message = {
      ...baseRecordMarkerCommandAttributes_DetailsEntry,
    } as RecordMarkerCommandAttributes_DetailsEntry;
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

  toJSON(message: RecordMarkerCommandAttributes_DetailsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value ? Payloads.toJSON(message.value) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<RecordMarkerCommandAttributes_DetailsEntry>,
  ): RecordMarkerCommandAttributes_DetailsEntry {
    const message = {
      ...baseRecordMarkerCommandAttributes_DetailsEntry,
    } as RecordMarkerCommandAttributes_DetailsEntry;
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

const baseContinueAsNewWorkflowExecutionCommandAttributes: object = {
  initiator: 0,
  cronSchedule: '',
};

export const ContinueAsNewWorkflowExecutionCommandAttributes = {
  encode(
    message: ContinueAsNewWorkflowExecutionCommandAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowType !== undefined) {
      WorkflowType.encode(
        message.workflowType,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(18).fork()).ldelim();
    }
    if (message.input !== undefined) {
      Payloads.encode(message.input, writer.uint32(26).fork()).ldelim();
    }
    if (message.workflowRunTimeout !== undefined) {
      Duration.encode(
        message.workflowRunTimeout,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.workflowTaskTimeout !== undefined) {
      Duration.encode(
        message.workflowTaskTimeout,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.backoffStartInterval !== undefined) {
      Duration.encode(
        message.backoffStartInterval,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.initiator !== 0) {
      writer.uint32(64).int32(message.initiator);
    }
    if (message.failure !== undefined) {
      Failure.encode(message.failure, writer.uint32(74).fork()).ldelim();
    }
    if (message.lastCompletionResult !== undefined) {
      Payloads.encode(
        message.lastCompletionResult,
        writer.uint32(82).fork(),
      ).ldelim();
    }
    if (message.cronSchedule !== '') {
      writer.uint32(90).string(message.cronSchedule);
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
  ): ContinueAsNewWorkflowExecutionCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseContinueAsNewWorkflowExecutionCommandAttributes,
    } as ContinueAsNewWorkflowExecutionCommandAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowType = WorkflowType.decode(reader, reader.uint32());
          break;
        case 2:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 3:
          message.input = Payloads.decode(reader, reader.uint32());
          break;
        case 4:
          message.workflowRunTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 5:
          message.workflowTaskTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.backoffStartInterval = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        case 8:
          message.initiator = reader.int32() as any;
          break;
        case 9:
          message.failure = Failure.decode(reader, reader.uint32());
          break;
        case 10:
          message.lastCompletionResult = Payloads.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 11:
          message.cronSchedule = reader.string();
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

  fromJSON(object: any): ContinueAsNewWorkflowExecutionCommandAttributes {
    const message = {
      ...baseContinueAsNewWorkflowExecutionCommandAttributes,
    } as ContinueAsNewWorkflowExecutionCommandAttributes;
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
      object.backoffStartInterval !== undefined &&
      object.backoffStartInterval !== null
    ) {
      message.backoffStartInterval = Duration.fromJSON(
        object.backoffStartInterval,
      );
    } else {
      message.backoffStartInterval = undefined;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromJSON(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
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

  toJSON(message: ContinueAsNewWorkflowExecutionCommandAttributes): unknown {
    const obj: any = {};
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
    message.backoffStartInterval !== undefined &&
      (obj.backoffStartInterval = message.backoffStartInterval
        ? Duration.toJSON(message.backoffStartInterval)
        : undefined);
    message.retryPolicy !== undefined &&
      (obj.retryPolicy = message.retryPolicy
        ? RetryPolicy.toJSON(message.retryPolicy)
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
    object: DeepPartial<ContinueAsNewWorkflowExecutionCommandAttributes>,
  ): ContinueAsNewWorkflowExecutionCommandAttributes {
    const message = {
      ...baseContinueAsNewWorkflowExecutionCommandAttributes,
    } as ContinueAsNewWorkflowExecutionCommandAttributes;
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
      object.backoffStartInterval !== undefined &&
      object.backoffStartInterval !== null
    ) {
      message.backoffStartInterval = Duration.fromPartial(
        object.backoffStartInterval,
      );
    } else {
      message.backoffStartInterval = undefined;
    }
    if (object.retryPolicy !== undefined && object.retryPolicy !== null) {
      message.retryPolicy = RetryPolicy.fromPartial(object.retryPolicy);
    } else {
      message.retryPolicy = undefined;
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

const baseStartChildWorkflowExecutionCommandAttributes: object = {
  namespace: '',
  workflowId: '',
  parentClosePolicy: 0,
  control: '',
  workflowIdReusePolicy: 0,
  cronSchedule: '',
};

export const StartChildWorkflowExecutionCommandAttributes = {
  encode(
    message: StartChildWorkflowExecutionCommandAttributes,
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
    if (message.workflowIdReusePolicy !== 0) {
      writer.uint32(88).int32(message.workflowIdReusePolicy);
    }
    if (message.retryPolicy !== undefined) {
      RetryPolicy.encode(
        message.retryPolicy,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.cronSchedule !== '') {
      writer.uint32(106).string(message.cronSchedule);
    }
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(114).fork()).ldelim();
    }
    if (message.memo !== undefined) {
      Memo.encode(message.memo, writer.uint32(122).fork()).ldelim();
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(130).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): StartChildWorkflowExecutionCommandAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseStartChildWorkflowExecutionCommandAttributes,
    } as StartChildWorkflowExecutionCommandAttributes;
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
          message.workflowIdReusePolicy = reader.int32() as any;
          break;
        case 12:
          message.retryPolicy = RetryPolicy.decode(reader, reader.uint32());
          break;
        case 13:
          message.cronSchedule = reader.string();
          break;
        case 14:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 15:
          message.memo = Memo.decode(reader, reader.uint32());
          break;
        case 16:
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

  fromJSON(object: any): StartChildWorkflowExecutionCommandAttributes {
    const message = {
      ...baseStartChildWorkflowExecutionCommandAttributes,
    } as StartChildWorkflowExecutionCommandAttributes;
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

  toJSON(message: StartChildWorkflowExecutionCommandAttributes): unknown {
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
    object: DeepPartial<StartChildWorkflowExecutionCommandAttributes>,
  ): StartChildWorkflowExecutionCommandAttributes {
    const message = {
      ...baseStartChildWorkflowExecutionCommandAttributes,
    } as StartChildWorkflowExecutionCommandAttributes;
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

const baseCommand: object = { commandType: 0 };

export const Command = {
  encode(
    message: Command,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.commandType !== 0) {
      writer.uint32(8).int32(message.commandType);
    }
    if (message.scheduleActivityTaskCommandAttributes !== undefined) {
      ScheduleActivityTaskCommandAttributes.encode(
        message.scheduleActivityTaskCommandAttributes,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.startTimerCommandAttributes !== undefined) {
      StartTimerCommandAttributes.encode(
        message.startTimerCommandAttributes,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.completeWorkflowExecutionCommandAttributes !== undefined) {
      CompleteWorkflowExecutionCommandAttributes.encode(
        message.completeWorkflowExecutionCommandAttributes,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.failWorkflowExecutionCommandAttributes !== undefined) {
      FailWorkflowExecutionCommandAttributes.encode(
        message.failWorkflowExecutionCommandAttributes,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.requestCancelActivityTaskCommandAttributes !== undefined) {
      RequestCancelActivityTaskCommandAttributes.encode(
        message.requestCancelActivityTaskCommandAttributes,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.cancelTimerCommandAttributes !== undefined) {
      CancelTimerCommandAttributes.encode(
        message.cancelTimerCommandAttributes,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.cancelWorkflowExecutionCommandAttributes !== undefined) {
      CancelWorkflowExecutionCommandAttributes.encode(
        message.cancelWorkflowExecutionCommandAttributes,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (
      message.requestCancelExternalWorkflowExecutionCommandAttributes !==
      undefined
    ) {
      RequestCancelExternalWorkflowExecutionCommandAttributes.encode(
        message.requestCancelExternalWorkflowExecutionCommandAttributes,
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.recordMarkerCommandAttributes !== undefined) {
      RecordMarkerCommandAttributes.encode(
        message.recordMarkerCommandAttributes,
        writer.uint32(82).fork(),
      ).ldelim();
    }
    if (message.continueAsNewWorkflowExecutionCommandAttributes !== undefined) {
      ContinueAsNewWorkflowExecutionCommandAttributes.encode(
        message.continueAsNewWorkflowExecutionCommandAttributes,
        writer.uint32(90).fork(),
      ).ldelim();
    }
    if (message.startChildWorkflowExecutionCommandAttributes !== undefined) {
      StartChildWorkflowExecutionCommandAttributes.encode(
        message.startChildWorkflowExecutionCommandAttributes,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (
      message.signalExternalWorkflowExecutionCommandAttributes !== undefined
    ) {
      SignalExternalWorkflowExecutionCommandAttributes.encode(
        message.signalExternalWorkflowExecutionCommandAttributes,
        writer.uint32(106).fork(),
      ).ldelim();
    }
    if (message.upsertWorkflowSearchAttributesCommandAttributes !== undefined) {
      UpsertWorkflowSearchAttributesCommandAttributes.encode(
        message.upsertWorkflowSearchAttributesCommandAttributes,
        writer.uint32(114).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Command {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCommand } as Command;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.commandType = reader.int32() as any;
          break;
        case 2:
          message.scheduleActivityTaskCommandAttributes = ScheduleActivityTaskCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.startTimerCommandAttributes = StartTimerCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 4:
          message.completeWorkflowExecutionCommandAttributes = CompleteWorkflowExecutionCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 5:
          message.failWorkflowExecutionCommandAttributes = FailWorkflowExecutionCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.requestCancelActivityTaskCommandAttributes = RequestCancelActivityTaskCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.cancelTimerCommandAttributes = CancelTimerCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 8:
          message.cancelWorkflowExecutionCommandAttributes = CancelWorkflowExecutionCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.requestCancelExternalWorkflowExecutionCommandAttributes = RequestCancelExternalWorkflowExecutionCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 10:
          message.recordMarkerCommandAttributes = RecordMarkerCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 11:
          message.continueAsNewWorkflowExecutionCommandAttributes = ContinueAsNewWorkflowExecutionCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 12:
          message.startChildWorkflowExecutionCommandAttributes = StartChildWorkflowExecutionCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 13:
          message.signalExternalWorkflowExecutionCommandAttributes = SignalExternalWorkflowExecutionCommandAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 14:
          message.upsertWorkflowSearchAttributesCommandAttributes = UpsertWorkflowSearchAttributesCommandAttributes.decode(
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

  fromJSON(object: any): Command {
    const message = { ...baseCommand } as Command;
    if (object.commandType !== undefined && object.commandType !== null) {
      message.commandType = commandTypeFromJSON(object.commandType);
    } else {
      message.commandType = 0;
    }
    if (
      object.scheduleActivityTaskCommandAttributes !== undefined &&
      object.scheduleActivityTaskCommandAttributes !== null
    ) {
      message.scheduleActivityTaskCommandAttributes = ScheduleActivityTaskCommandAttributes.fromJSON(
        object.scheduleActivityTaskCommandAttributes,
      );
    } else {
      message.scheduleActivityTaskCommandAttributes = undefined;
    }
    if (
      object.startTimerCommandAttributes !== undefined &&
      object.startTimerCommandAttributes !== null
    ) {
      message.startTimerCommandAttributes = StartTimerCommandAttributes.fromJSON(
        object.startTimerCommandAttributes,
      );
    } else {
      message.startTimerCommandAttributes = undefined;
    }
    if (
      object.completeWorkflowExecutionCommandAttributes !== undefined &&
      object.completeWorkflowExecutionCommandAttributes !== null
    ) {
      message.completeWorkflowExecutionCommandAttributes = CompleteWorkflowExecutionCommandAttributes.fromJSON(
        object.completeWorkflowExecutionCommandAttributes,
      );
    } else {
      message.completeWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.failWorkflowExecutionCommandAttributes !== undefined &&
      object.failWorkflowExecutionCommandAttributes !== null
    ) {
      message.failWorkflowExecutionCommandAttributes = FailWorkflowExecutionCommandAttributes.fromJSON(
        object.failWorkflowExecutionCommandAttributes,
      );
    } else {
      message.failWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.requestCancelActivityTaskCommandAttributes !== undefined &&
      object.requestCancelActivityTaskCommandAttributes !== null
    ) {
      message.requestCancelActivityTaskCommandAttributes = RequestCancelActivityTaskCommandAttributes.fromJSON(
        object.requestCancelActivityTaskCommandAttributes,
      );
    } else {
      message.requestCancelActivityTaskCommandAttributes = undefined;
    }
    if (
      object.cancelTimerCommandAttributes !== undefined &&
      object.cancelTimerCommandAttributes !== null
    ) {
      message.cancelTimerCommandAttributes = CancelTimerCommandAttributes.fromJSON(
        object.cancelTimerCommandAttributes,
      );
    } else {
      message.cancelTimerCommandAttributes = undefined;
    }
    if (
      object.cancelWorkflowExecutionCommandAttributes !== undefined &&
      object.cancelWorkflowExecutionCommandAttributes !== null
    ) {
      message.cancelWorkflowExecutionCommandAttributes = CancelWorkflowExecutionCommandAttributes.fromJSON(
        object.cancelWorkflowExecutionCommandAttributes,
      );
    } else {
      message.cancelWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.requestCancelExternalWorkflowExecutionCommandAttributes !==
        undefined &&
      object.requestCancelExternalWorkflowExecutionCommandAttributes !== null
    ) {
      message.requestCancelExternalWorkflowExecutionCommandAttributes = RequestCancelExternalWorkflowExecutionCommandAttributes.fromJSON(
        object.requestCancelExternalWorkflowExecutionCommandAttributes,
      );
    } else {
      message.requestCancelExternalWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.recordMarkerCommandAttributes !== undefined &&
      object.recordMarkerCommandAttributes !== null
    ) {
      message.recordMarkerCommandAttributes = RecordMarkerCommandAttributes.fromJSON(
        object.recordMarkerCommandAttributes,
      );
    } else {
      message.recordMarkerCommandAttributes = undefined;
    }
    if (
      object.continueAsNewWorkflowExecutionCommandAttributes !== undefined &&
      object.continueAsNewWorkflowExecutionCommandAttributes !== null
    ) {
      message.continueAsNewWorkflowExecutionCommandAttributes = ContinueAsNewWorkflowExecutionCommandAttributes.fromJSON(
        object.continueAsNewWorkflowExecutionCommandAttributes,
      );
    } else {
      message.continueAsNewWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.startChildWorkflowExecutionCommandAttributes !== undefined &&
      object.startChildWorkflowExecutionCommandAttributes !== null
    ) {
      message.startChildWorkflowExecutionCommandAttributes = StartChildWorkflowExecutionCommandAttributes.fromJSON(
        object.startChildWorkflowExecutionCommandAttributes,
      );
    } else {
      message.startChildWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.signalExternalWorkflowExecutionCommandAttributes !== undefined &&
      object.signalExternalWorkflowExecutionCommandAttributes !== null
    ) {
      message.signalExternalWorkflowExecutionCommandAttributes = SignalExternalWorkflowExecutionCommandAttributes.fromJSON(
        object.signalExternalWorkflowExecutionCommandAttributes,
      );
    } else {
      message.signalExternalWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.upsertWorkflowSearchAttributesCommandAttributes !== undefined &&
      object.upsertWorkflowSearchAttributesCommandAttributes !== null
    ) {
      message.upsertWorkflowSearchAttributesCommandAttributes = UpsertWorkflowSearchAttributesCommandAttributes.fromJSON(
        object.upsertWorkflowSearchAttributesCommandAttributes,
      );
    } else {
      message.upsertWorkflowSearchAttributesCommandAttributes = undefined;
    }
    return message;
  },

  toJSON(message: Command): unknown {
    const obj: any = {};
    message.commandType !== undefined &&
      (obj.commandType = commandTypeToJSON(message.commandType));
    message.scheduleActivityTaskCommandAttributes !== undefined &&
      (obj.scheduleActivityTaskCommandAttributes = message.scheduleActivityTaskCommandAttributes
        ? ScheduleActivityTaskCommandAttributes.toJSON(
            message.scheduleActivityTaskCommandAttributes,
          )
        : undefined);
    message.startTimerCommandAttributes !== undefined &&
      (obj.startTimerCommandAttributes = message.startTimerCommandAttributes
        ? StartTimerCommandAttributes.toJSON(
            message.startTimerCommandAttributes,
          )
        : undefined);
    message.completeWorkflowExecutionCommandAttributes !== undefined &&
      (obj.completeWorkflowExecutionCommandAttributes = message.completeWorkflowExecutionCommandAttributes
        ? CompleteWorkflowExecutionCommandAttributes.toJSON(
            message.completeWorkflowExecutionCommandAttributes,
          )
        : undefined);
    message.failWorkflowExecutionCommandAttributes !== undefined &&
      (obj.failWorkflowExecutionCommandAttributes = message.failWorkflowExecutionCommandAttributes
        ? FailWorkflowExecutionCommandAttributes.toJSON(
            message.failWorkflowExecutionCommandAttributes,
          )
        : undefined);
    message.requestCancelActivityTaskCommandAttributes !== undefined &&
      (obj.requestCancelActivityTaskCommandAttributes = message.requestCancelActivityTaskCommandAttributes
        ? RequestCancelActivityTaskCommandAttributes.toJSON(
            message.requestCancelActivityTaskCommandAttributes,
          )
        : undefined);
    message.cancelTimerCommandAttributes !== undefined &&
      (obj.cancelTimerCommandAttributes = message.cancelTimerCommandAttributes
        ? CancelTimerCommandAttributes.toJSON(
            message.cancelTimerCommandAttributes,
          )
        : undefined);
    message.cancelWorkflowExecutionCommandAttributes !== undefined &&
      (obj.cancelWorkflowExecutionCommandAttributes = message.cancelWorkflowExecutionCommandAttributes
        ? CancelWorkflowExecutionCommandAttributes.toJSON(
            message.cancelWorkflowExecutionCommandAttributes,
          )
        : undefined);
    message.requestCancelExternalWorkflowExecutionCommandAttributes !==
      undefined &&
      (obj.requestCancelExternalWorkflowExecutionCommandAttributes = message.requestCancelExternalWorkflowExecutionCommandAttributes
        ? RequestCancelExternalWorkflowExecutionCommandAttributes.toJSON(
            message.requestCancelExternalWorkflowExecutionCommandAttributes,
          )
        : undefined);
    message.recordMarkerCommandAttributes !== undefined &&
      (obj.recordMarkerCommandAttributes = message.recordMarkerCommandAttributes
        ? RecordMarkerCommandAttributes.toJSON(
            message.recordMarkerCommandAttributes,
          )
        : undefined);
    message.continueAsNewWorkflowExecutionCommandAttributes !== undefined &&
      (obj.continueAsNewWorkflowExecutionCommandAttributes = message.continueAsNewWorkflowExecutionCommandAttributes
        ? ContinueAsNewWorkflowExecutionCommandAttributes.toJSON(
            message.continueAsNewWorkflowExecutionCommandAttributes,
          )
        : undefined);
    message.startChildWorkflowExecutionCommandAttributes !== undefined &&
      (obj.startChildWorkflowExecutionCommandAttributes = message.startChildWorkflowExecutionCommandAttributes
        ? StartChildWorkflowExecutionCommandAttributes.toJSON(
            message.startChildWorkflowExecutionCommandAttributes,
          )
        : undefined);
    message.signalExternalWorkflowExecutionCommandAttributes !== undefined &&
      (obj.signalExternalWorkflowExecutionCommandAttributes = message.signalExternalWorkflowExecutionCommandAttributes
        ? SignalExternalWorkflowExecutionCommandAttributes.toJSON(
            message.signalExternalWorkflowExecutionCommandAttributes,
          )
        : undefined);
    message.upsertWorkflowSearchAttributesCommandAttributes !== undefined &&
      (obj.upsertWorkflowSearchAttributesCommandAttributes = message.upsertWorkflowSearchAttributesCommandAttributes
        ? UpsertWorkflowSearchAttributesCommandAttributes.toJSON(
            message.upsertWorkflowSearchAttributesCommandAttributes,
          )
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Command>): Command {
    const message = { ...baseCommand } as Command;
    if (object.commandType !== undefined && object.commandType !== null) {
      message.commandType = object.commandType;
    } else {
      message.commandType = 0;
    }
    if (
      object.scheduleActivityTaskCommandAttributes !== undefined &&
      object.scheduleActivityTaskCommandAttributes !== null
    ) {
      message.scheduleActivityTaskCommandAttributes = ScheduleActivityTaskCommandAttributes.fromPartial(
        object.scheduleActivityTaskCommandAttributes,
      );
    } else {
      message.scheduleActivityTaskCommandAttributes = undefined;
    }
    if (
      object.startTimerCommandAttributes !== undefined &&
      object.startTimerCommandAttributes !== null
    ) {
      message.startTimerCommandAttributes = StartTimerCommandAttributes.fromPartial(
        object.startTimerCommandAttributes,
      );
    } else {
      message.startTimerCommandAttributes = undefined;
    }
    if (
      object.completeWorkflowExecutionCommandAttributes !== undefined &&
      object.completeWorkflowExecutionCommandAttributes !== null
    ) {
      message.completeWorkflowExecutionCommandAttributes = CompleteWorkflowExecutionCommandAttributes.fromPartial(
        object.completeWorkflowExecutionCommandAttributes,
      );
    } else {
      message.completeWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.failWorkflowExecutionCommandAttributes !== undefined &&
      object.failWorkflowExecutionCommandAttributes !== null
    ) {
      message.failWorkflowExecutionCommandAttributes = FailWorkflowExecutionCommandAttributes.fromPartial(
        object.failWorkflowExecutionCommandAttributes,
      );
    } else {
      message.failWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.requestCancelActivityTaskCommandAttributes !== undefined &&
      object.requestCancelActivityTaskCommandAttributes !== null
    ) {
      message.requestCancelActivityTaskCommandAttributes = RequestCancelActivityTaskCommandAttributes.fromPartial(
        object.requestCancelActivityTaskCommandAttributes,
      );
    } else {
      message.requestCancelActivityTaskCommandAttributes = undefined;
    }
    if (
      object.cancelTimerCommandAttributes !== undefined &&
      object.cancelTimerCommandAttributes !== null
    ) {
      message.cancelTimerCommandAttributes = CancelTimerCommandAttributes.fromPartial(
        object.cancelTimerCommandAttributes,
      );
    } else {
      message.cancelTimerCommandAttributes = undefined;
    }
    if (
      object.cancelWorkflowExecutionCommandAttributes !== undefined &&
      object.cancelWorkflowExecutionCommandAttributes !== null
    ) {
      message.cancelWorkflowExecutionCommandAttributes = CancelWorkflowExecutionCommandAttributes.fromPartial(
        object.cancelWorkflowExecutionCommandAttributes,
      );
    } else {
      message.cancelWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.requestCancelExternalWorkflowExecutionCommandAttributes !==
        undefined &&
      object.requestCancelExternalWorkflowExecutionCommandAttributes !== null
    ) {
      message.requestCancelExternalWorkflowExecutionCommandAttributes = RequestCancelExternalWorkflowExecutionCommandAttributes.fromPartial(
        object.requestCancelExternalWorkflowExecutionCommandAttributes,
      );
    } else {
      message.requestCancelExternalWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.recordMarkerCommandAttributes !== undefined &&
      object.recordMarkerCommandAttributes !== null
    ) {
      message.recordMarkerCommandAttributes = RecordMarkerCommandAttributes.fromPartial(
        object.recordMarkerCommandAttributes,
      );
    } else {
      message.recordMarkerCommandAttributes = undefined;
    }
    if (
      object.continueAsNewWorkflowExecutionCommandAttributes !== undefined &&
      object.continueAsNewWorkflowExecutionCommandAttributes !== null
    ) {
      message.continueAsNewWorkflowExecutionCommandAttributes = ContinueAsNewWorkflowExecutionCommandAttributes.fromPartial(
        object.continueAsNewWorkflowExecutionCommandAttributes,
      );
    } else {
      message.continueAsNewWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.startChildWorkflowExecutionCommandAttributes !== undefined &&
      object.startChildWorkflowExecutionCommandAttributes !== null
    ) {
      message.startChildWorkflowExecutionCommandAttributes = StartChildWorkflowExecutionCommandAttributes.fromPartial(
        object.startChildWorkflowExecutionCommandAttributes,
      );
    } else {
      message.startChildWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.signalExternalWorkflowExecutionCommandAttributes !== undefined &&
      object.signalExternalWorkflowExecutionCommandAttributes !== null
    ) {
      message.signalExternalWorkflowExecutionCommandAttributes = SignalExternalWorkflowExecutionCommandAttributes.fromPartial(
        object.signalExternalWorkflowExecutionCommandAttributes,
      );
    } else {
      message.signalExternalWorkflowExecutionCommandAttributes = undefined;
    }
    if (
      object.upsertWorkflowSearchAttributesCommandAttributes !== undefined &&
      object.upsertWorkflowSearchAttributesCommandAttributes !== null
    ) {
      message.upsertWorkflowSearchAttributesCommandAttributes = UpsertWorkflowSearchAttributesCommandAttributes.fromPartial(
        object.upsertWorkflowSearchAttributesCommandAttributes,
      );
    } else {
      message.upsertWorkflowSearchAttributesCommandAttributes = undefined;
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
