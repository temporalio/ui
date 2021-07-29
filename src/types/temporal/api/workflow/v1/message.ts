/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  WorkflowExecutionStatus,
  PendingActivityState,
  ParentClosePolicy,
  workflowExecutionStatusFromJSON,
  workflowExecutionStatusToJSON,
  pendingActivityStateFromJSON,
  pendingActivityStateToJSON,
  parentClosePolicyFromJSON,
  parentClosePolicyToJSON,
} from '../../../../temporal/api/enums/v1/workflow';
import { Timestamp } from '../../../../google/protobuf/timestamp';
import {
  WorkflowExecution,
  WorkflowType,
  Memo,
  SearchAttributes,
  ActivityType,
  Payloads,
} from '../../../../temporal/api/common/v1/message';
import { TaskQueue } from '../../../../temporal/api/taskqueue/v1/message';
import { Duration } from '../../../../google/protobuf/duration';
import { Failure } from '../../../../temporal/api/failure/v1/message';

export const protobufPackage = 'temporal.api.workflow.v1';

export interface WorkflowExecutionInfo {
  execution: WorkflowExecution | undefined;
  type: WorkflowType | undefined;
  startTime: Date | undefined;
  closeTime: Date | undefined;
  status: WorkflowExecutionStatus;
  historyLength: number;
  parentNamespaceId: string;
  parentExecution: WorkflowExecution | undefined;
  executionTime: Date | undefined;
  memo: Memo | undefined;
  searchAttributes: SearchAttributes | undefined;
  autoResetPoints: ResetPoints | undefined;
  taskQueue: string;
  stateTransitionCount: number;
}

export interface WorkflowExecutionConfig {
  taskQueue: TaskQueue | undefined;
  workflowExecutionTimeout: Duration | undefined;
  workflowRunTimeout: Duration | undefined;
  defaultWorkflowTaskTimeout: Duration | undefined;
}

export interface PendingActivityInfo {
  activityId: string;
  activityType: ActivityType | undefined;
  state: PendingActivityState;
  heartbeatDetails: Payloads | undefined;
  lastHeartbeatTime: Date | undefined;
  lastStartedTime: Date | undefined;
  attempt: number;
  maximumAttempts: number;
  scheduledTime: Date | undefined;
  expirationTime: Date | undefined;
  lastFailure: Failure | undefined;
  lastWorkerIdentity: string;
}

export interface PendingChildExecutionInfo {
  workflowId: string;
  runId: string;
  workflowTypeName: string;
  initiatedId: number;
  /** Default: PARENT_CLOSE_POLICY_TERMINATE. */
  parentClosePolicy: ParentClosePolicy;
}

export interface ResetPoints {
  points: ResetPointInfo[];
}

export interface ResetPointInfo {
  binaryChecksum: string;
  runId: string;
  firstWorkflowTaskCompletedId: number;
  createTime: Date | undefined;
  /**
   * (-- api-linter: core::0214::resource-expiry=disabled
   *     aip.dev/not-precedent: TTL is not defined for ResetPointInfo. --)
   * The time that the run is deleted due to retention.
   */
  expireTime: Date | undefined;
  /** false if the reset point has pending childWFs/reqCancels/signalExternals. */
  resettable: boolean;
}

const baseWorkflowExecutionInfo: object = {
  status: 0,
  historyLength: 0,
  parentNamespaceId: '',
  taskQueue: '',
  stateTransitionCount: 0,
};

export const WorkflowExecutionInfo = {
  encode(
    message: WorkflowExecutionInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.execution !== undefined) {
      WorkflowExecution.encode(
        message.execution,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.type !== undefined) {
      WorkflowType.encode(message.type, writer.uint32(18).fork()).ldelim();
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.closeTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.closeTime),
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(40).int32(message.status);
    }
    if (message.historyLength !== 0) {
      writer.uint32(48).int64(message.historyLength);
    }
    if (message.parentNamespaceId !== '') {
      writer.uint32(58).string(message.parentNamespaceId);
    }
    if (message.parentExecution !== undefined) {
      WorkflowExecution.encode(
        message.parentExecution,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.executionTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.executionTime),
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.memo !== undefined) {
      Memo.encode(message.memo, writer.uint32(82).fork()).ldelim();
    }
    if (message.searchAttributes !== undefined) {
      SearchAttributes.encode(
        message.searchAttributes,
        writer.uint32(90).fork(),
      ).ldelim();
    }
    if (message.autoResetPoints !== undefined) {
      ResetPoints.encode(
        message.autoResetPoints,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.taskQueue !== '') {
      writer.uint32(106).string(message.taskQueue);
    }
    if (message.stateTransitionCount !== 0) {
      writer.uint32(112).int64(message.stateTransitionCount);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWorkflowExecutionInfo } as WorkflowExecutionInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.execution = WorkflowExecution.decode(reader, reader.uint32());
          break;
        case 2:
          message.type = WorkflowType.decode(reader, reader.uint32());
          break;
        case 3:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 4:
          message.closeTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 5:
          message.status = reader.int32() as any;
          break;
        case 6:
          message.historyLength = longToNumber(reader.int64() as Long);
          break;
        case 7:
          message.parentNamespaceId = reader.string();
          break;
        case 8:
          message.parentExecution = WorkflowExecution.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.executionTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 10:
          message.memo = Memo.decode(reader, reader.uint32());
          break;
        case 11:
          message.searchAttributes = SearchAttributes.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 12:
          message.autoResetPoints = ResetPoints.decode(reader, reader.uint32());
          break;
        case 13:
          message.taskQueue = reader.string();
          break;
        case 14:
          message.stateTransitionCount = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionInfo {
    const message = { ...baseWorkflowExecutionInfo } as WorkflowExecutionInfo;
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromJSON(object.execution);
    } else {
      message.execution = undefined;
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = WorkflowType.fromJSON(object.type);
    } else {
      message.type = undefined;
    }
    if (object.startTime !== undefined && object.startTime !== null) {
      message.startTime = fromJsonTimestamp(object.startTime);
    } else {
      message.startTime = undefined;
    }
    if (object.closeTime !== undefined && object.closeTime !== null) {
      message.closeTime = fromJsonTimestamp(object.closeTime);
    } else {
      message.closeTime = undefined;
    }
    if (object.status !== undefined && object.status !== null) {
      message.status = workflowExecutionStatusFromJSON(object.status);
    } else {
      message.status = 0;
    }
    if (object.historyLength !== undefined && object.historyLength !== null) {
      message.historyLength = Number(object.historyLength);
    } else {
      message.historyLength = 0;
    }
    if (
      object.parentNamespaceId !== undefined &&
      object.parentNamespaceId !== null
    ) {
      message.parentNamespaceId = String(object.parentNamespaceId);
    } else {
      message.parentNamespaceId = '';
    }
    if (
      object.parentExecution !== undefined &&
      object.parentExecution !== null
    ) {
      message.parentExecution = WorkflowExecution.fromJSON(
        object.parentExecution,
      );
    } else {
      message.parentExecution = undefined;
    }
    if (object.executionTime !== undefined && object.executionTime !== null) {
      message.executionTime = fromJsonTimestamp(object.executionTime);
    } else {
      message.executionTime = undefined;
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
      object.autoResetPoints !== undefined &&
      object.autoResetPoints !== null
    ) {
      message.autoResetPoints = ResetPoints.fromJSON(object.autoResetPoints);
    } else {
      message.autoResetPoints = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = String(object.taskQueue);
    } else {
      message.taskQueue = '';
    }
    if (
      object.stateTransitionCount !== undefined &&
      object.stateTransitionCount !== null
    ) {
      message.stateTransitionCount = Number(object.stateTransitionCount);
    } else {
      message.stateTransitionCount = 0;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionInfo): unknown {
    const obj: any = {};
    message.execution !== undefined &&
      (obj.execution = message.execution
        ? WorkflowExecution.toJSON(message.execution)
        : undefined);
    message.type !== undefined &&
      (obj.type = message.type ? WorkflowType.toJSON(message.type) : undefined);
    message.startTime !== undefined &&
      (obj.startTime = message.startTime.toISOString());
    message.closeTime !== undefined &&
      (obj.closeTime = message.closeTime.toISOString());
    message.status !== undefined &&
      (obj.status = workflowExecutionStatusToJSON(message.status));
    message.historyLength !== undefined &&
      (obj.historyLength = message.historyLength);
    message.parentNamespaceId !== undefined &&
      (obj.parentNamespaceId = message.parentNamespaceId);
    message.parentExecution !== undefined &&
      (obj.parentExecution = message.parentExecution
        ? WorkflowExecution.toJSON(message.parentExecution)
        : undefined);
    message.executionTime !== undefined &&
      (obj.executionTime = message.executionTime.toISOString());
    message.memo !== undefined &&
      (obj.memo = message.memo ? Memo.toJSON(message.memo) : undefined);
    message.searchAttributes !== undefined &&
      (obj.searchAttributes = message.searchAttributes
        ? SearchAttributes.toJSON(message.searchAttributes)
        : undefined);
    message.autoResetPoints !== undefined &&
      (obj.autoResetPoints = message.autoResetPoints
        ? ResetPoints.toJSON(message.autoResetPoints)
        : undefined);
    message.taskQueue !== undefined && (obj.taskQueue = message.taskQueue);
    message.stateTransitionCount !== undefined &&
      (obj.stateTransitionCount = message.stateTransitionCount);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionInfo>,
  ): WorkflowExecutionInfo {
    const message = { ...baseWorkflowExecutionInfo } as WorkflowExecutionInfo;
    if (object.execution !== undefined && object.execution !== null) {
      message.execution = WorkflowExecution.fromPartial(object.execution);
    } else {
      message.execution = undefined;
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = WorkflowType.fromPartial(object.type);
    } else {
      message.type = undefined;
    }
    if (object.startTime !== undefined && object.startTime !== null) {
      message.startTime = object.startTime;
    } else {
      message.startTime = undefined;
    }
    if (object.closeTime !== undefined && object.closeTime !== null) {
      message.closeTime = object.closeTime;
    } else {
      message.closeTime = undefined;
    }
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    } else {
      message.status = 0;
    }
    if (object.historyLength !== undefined && object.historyLength !== null) {
      message.historyLength = object.historyLength;
    } else {
      message.historyLength = 0;
    }
    if (
      object.parentNamespaceId !== undefined &&
      object.parentNamespaceId !== null
    ) {
      message.parentNamespaceId = object.parentNamespaceId;
    } else {
      message.parentNamespaceId = '';
    }
    if (
      object.parentExecution !== undefined &&
      object.parentExecution !== null
    ) {
      message.parentExecution = WorkflowExecution.fromPartial(
        object.parentExecution,
      );
    } else {
      message.parentExecution = undefined;
    }
    if (object.executionTime !== undefined && object.executionTime !== null) {
      message.executionTime = object.executionTime;
    } else {
      message.executionTime = undefined;
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
      object.autoResetPoints !== undefined &&
      object.autoResetPoints !== null
    ) {
      message.autoResetPoints = ResetPoints.fromPartial(object.autoResetPoints);
    } else {
      message.autoResetPoints = undefined;
    }
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = object.taskQueue;
    } else {
      message.taskQueue = '';
    }
    if (
      object.stateTransitionCount !== undefined &&
      object.stateTransitionCount !== null
    ) {
      message.stateTransitionCount = object.stateTransitionCount;
    } else {
      message.stateTransitionCount = 0;
    }
    return message;
  },
};

const baseWorkflowExecutionConfig: object = {};

export const WorkflowExecutionConfig = {
  encode(
    message: WorkflowExecutionConfig,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.taskQueue !== undefined) {
      TaskQueue.encode(message.taskQueue, writer.uint32(10).fork()).ldelim();
    }
    if (message.workflowExecutionTimeout !== undefined) {
      Duration.encode(
        message.workflowExecutionTimeout,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.workflowRunTimeout !== undefined) {
      Duration.encode(
        message.workflowRunTimeout,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.defaultWorkflowTaskTimeout !== undefined) {
      Duration.encode(
        message.defaultWorkflowTaskTimeout,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionConfig,
    } as WorkflowExecutionConfig;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.taskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 2:
          message.workflowExecutionTimeout = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 3:
          message.workflowRunTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 4:
          message.defaultWorkflowTaskTimeout = Duration.decode(
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

  fromJSON(object: any): WorkflowExecutionConfig {
    const message = {
      ...baseWorkflowExecutionConfig,
    } as WorkflowExecutionConfig;
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromJSON(object.taskQueue);
    } else {
      message.taskQueue = undefined;
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
      object.defaultWorkflowTaskTimeout !== undefined &&
      object.defaultWorkflowTaskTimeout !== null
    ) {
      message.defaultWorkflowTaskTimeout = Duration.fromJSON(
        object.defaultWorkflowTaskTimeout,
      );
    } else {
      message.defaultWorkflowTaskTimeout = undefined;
    }
    return message;
  },

  toJSON(message: WorkflowExecutionConfig): unknown {
    const obj: any = {};
    message.taskQueue !== undefined &&
      (obj.taskQueue = message.taskQueue
        ? TaskQueue.toJSON(message.taskQueue)
        : undefined);
    message.workflowExecutionTimeout !== undefined &&
      (obj.workflowExecutionTimeout = message.workflowExecutionTimeout
        ? Duration.toJSON(message.workflowExecutionTimeout)
        : undefined);
    message.workflowRunTimeout !== undefined &&
      (obj.workflowRunTimeout = message.workflowRunTimeout
        ? Duration.toJSON(message.workflowRunTimeout)
        : undefined);
    message.defaultWorkflowTaskTimeout !== undefined &&
      (obj.defaultWorkflowTaskTimeout = message.defaultWorkflowTaskTimeout
        ? Duration.toJSON(message.defaultWorkflowTaskTimeout)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionConfig>,
  ): WorkflowExecutionConfig {
    const message = {
      ...baseWorkflowExecutionConfig,
    } as WorkflowExecutionConfig;
    if (object.taskQueue !== undefined && object.taskQueue !== null) {
      message.taskQueue = TaskQueue.fromPartial(object.taskQueue);
    } else {
      message.taskQueue = undefined;
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
      object.defaultWorkflowTaskTimeout !== undefined &&
      object.defaultWorkflowTaskTimeout !== null
    ) {
      message.defaultWorkflowTaskTimeout = Duration.fromPartial(
        object.defaultWorkflowTaskTimeout,
      );
    } else {
      message.defaultWorkflowTaskTimeout = undefined;
    }
    return message;
  },
};

const basePendingActivityInfo: object = {
  activityId: '',
  state: 0,
  attempt: 0,
  maximumAttempts: 0,
  lastWorkerIdentity: '',
};

export const PendingActivityInfo = {
  encode(
    message: PendingActivityInfo,
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
    if (message.state !== 0) {
      writer.uint32(24).int32(message.state);
    }
    if (message.heartbeatDetails !== undefined) {
      Payloads.encode(
        message.heartbeatDetails,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.lastHeartbeatTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastHeartbeatTime),
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.lastStartedTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastStartedTime),
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.attempt !== 0) {
      writer.uint32(56).int32(message.attempt);
    }
    if (message.maximumAttempts !== 0) {
      writer.uint32(64).int32(message.maximumAttempts);
    }
    if (message.scheduledTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.scheduledTime),
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.expirationTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.expirationTime),
        writer.uint32(82).fork(),
      ).ldelim();
    }
    if (message.lastFailure !== undefined) {
      Failure.encode(message.lastFailure, writer.uint32(90).fork()).ldelim();
    }
    if (message.lastWorkerIdentity !== '') {
      writer.uint32(98).string(message.lastWorkerIdentity);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PendingActivityInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...basePendingActivityInfo } as PendingActivityInfo;
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
          message.state = reader.int32() as any;
          break;
        case 4:
          message.heartbeatDetails = Payloads.decode(reader, reader.uint32());
          break;
        case 5:
          message.lastHeartbeatTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 6:
          message.lastStartedTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 7:
          message.attempt = reader.int32();
          break;
        case 8:
          message.maximumAttempts = reader.int32();
          break;
        case 9:
          message.scheduledTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 10:
          message.expirationTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 11:
          message.lastFailure = Failure.decode(reader, reader.uint32());
          break;
        case 12:
          message.lastWorkerIdentity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PendingActivityInfo {
    const message = { ...basePendingActivityInfo } as PendingActivityInfo;
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
    if (object.state !== undefined && object.state !== null) {
      message.state = pendingActivityStateFromJSON(object.state);
    } else {
      message.state = 0;
    }
    if (
      object.heartbeatDetails !== undefined &&
      object.heartbeatDetails !== null
    ) {
      message.heartbeatDetails = Payloads.fromJSON(object.heartbeatDetails);
    } else {
      message.heartbeatDetails = undefined;
    }
    if (
      object.lastHeartbeatTime !== undefined &&
      object.lastHeartbeatTime !== null
    ) {
      message.lastHeartbeatTime = fromJsonTimestamp(object.lastHeartbeatTime);
    } else {
      message.lastHeartbeatTime = undefined;
    }
    if (
      object.lastStartedTime !== undefined &&
      object.lastStartedTime !== null
    ) {
      message.lastStartedTime = fromJsonTimestamp(object.lastStartedTime);
    } else {
      message.lastStartedTime = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = Number(object.attempt);
    } else {
      message.attempt = 0;
    }
    if (
      object.maximumAttempts !== undefined &&
      object.maximumAttempts !== null
    ) {
      message.maximumAttempts = Number(object.maximumAttempts);
    } else {
      message.maximumAttempts = 0;
    }
    if (object.scheduledTime !== undefined && object.scheduledTime !== null) {
      message.scheduledTime = fromJsonTimestamp(object.scheduledTime);
    } else {
      message.scheduledTime = undefined;
    }
    if (object.expirationTime !== undefined && object.expirationTime !== null) {
      message.expirationTime = fromJsonTimestamp(object.expirationTime);
    } else {
      message.expirationTime = undefined;
    }
    if (object.lastFailure !== undefined && object.lastFailure !== null) {
      message.lastFailure = Failure.fromJSON(object.lastFailure);
    } else {
      message.lastFailure = undefined;
    }
    if (
      object.lastWorkerIdentity !== undefined &&
      object.lastWorkerIdentity !== null
    ) {
      message.lastWorkerIdentity = String(object.lastWorkerIdentity);
    } else {
      message.lastWorkerIdentity = '';
    }
    return message;
  },

  toJSON(message: PendingActivityInfo): unknown {
    const obj: any = {};
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.activityType !== undefined &&
      (obj.activityType = message.activityType
        ? ActivityType.toJSON(message.activityType)
        : undefined);
    message.state !== undefined &&
      (obj.state = pendingActivityStateToJSON(message.state));
    message.heartbeatDetails !== undefined &&
      (obj.heartbeatDetails = message.heartbeatDetails
        ? Payloads.toJSON(message.heartbeatDetails)
        : undefined);
    message.lastHeartbeatTime !== undefined &&
      (obj.lastHeartbeatTime = message.lastHeartbeatTime.toISOString());
    message.lastStartedTime !== undefined &&
      (obj.lastStartedTime = message.lastStartedTime.toISOString());
    message.attempt !== undefined && (obj.attempt = message.attempt);
    message.maximumAttempts !== undefined &&
      (obj.maximumAttempts = message.maximumAttempts);
    message.scheduledTime !== undefined &&
      (obj.scheduledTime = message.scheduledTime.toISOString());
    message.expirationTime !== undefined &&
      (obj.expirationTime = message.expirationTime.toISOString());
    message.lastFailure !== undefined &&
      (obj.lastFailure = message.lastFailure
        ? Failure.toJSON(message.lastFailure)
        : undefined);
    message.lastWorkerIdentity !== undefined &&
      (obj.lastWorkerIdentity = message.lastWorkerIdentity);
    return obj;
  },

  fromPartial(object: DeepPartial<PendingActivityInfo>): PendingActivityInfo {
    const message = { ...basePendingActivityInfo } as PendingActivityInfo;
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
    if (object.state !== undefined && object.state !== null) {
      message.state = object.state;
    } else {
      message.state = 0;
    }
    if (
      object.heartbeatDetails !== undefined &&
      object.heartbeatDetails !== null
    ) {
      message.heartbeatDetails = Payloads.fromPartial(object.heartbeatDetails);
    } else {
      message.heartbeatDetails = undefined;
    }
    if (
      object.lastHeartbeatTime !== undefined &&
      object.lastHeartbeatTime !== null
    ) {
      message.lastHeartbeatTime = object.lastHeartbeatTime;
    } else {
      message.lastHeartbeatTime = undefined;
    }
    if (
      object.lastStartedTime !== undefined &&
      object.lastStartedTime !== null
    ) {
      message.lastStartedTime = object.lastStartedTime;
    } else {
      message.lastStartedTime = undefined;
    }
    if (object.attempt !== undefined && object.attempt !== null) {
      message.attempt = object.attempt;
    } else {
      message.attempt = 0;
    }
    if (
      object.maximumAttempts !== undefined &&
      object.maximumAttempts !== null
    ) {
      message.maximumAttempts = object.maximumAttempts;
    } else {
      message.maximumAttempts = 0;
    }
    if (object.scheduledTime !== undefined && object.scheduledTime !== null) {
      message.scheduledTime = object.scheduledTime;
    } else {
      message.scheduledTime = undefined;
    }
    if (object.expirationTime !== undefined && object.expirationTime !== null) {
      message.expirationTime = object.expirationTime;
    } else {
      message.expirationTime = undefined;
    }
    if (object.lastFailure !== undefined && object.lastFailure !== null) {
      message.lastFailure = Failure.fromPartial(object.lastFailure);
    } else {
      message.lastFailure = undefined;
    }
    if (
      object.lastWorkerIdentity !== undefined &&
      object.lastWorkerIdentity !== null
    ) {
      message.lastWorkerIdentity = object.lastWorkerIdentity;
    } else {
      message.lastWorkerIdentity = '';
    }
    return message;
  },
};

const basePendingChildExecutionInfo: object = {
  workflowId: '',
  runId: '',
  workflowTypeName: '',
  initiatedId: 0,
  parentClosePolicy: 0,
};

export const PendingChildExecutionInfo = {
  encode(
    message: PendingChildExecutionInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowId !== '') {
      writer.uint32(10).string(message.workflowId);
    }
    if (message.runId !== '') {
      writer.uint32(18).string(message.runId);
    }
    if (message.workflowTypeName !== '') {
      writer.uint32(26).string(message.workflowTypeName);
    }
    if (message.initiatedId !== 0) {
      writer.uint32(32).int64(message.initiatedId);
    }
    if (message.parentClosePolicy !== 0) {
      writer.uint32(40).int32(message.parentClosePolicy);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PendingChildExecutionInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePendingChildExecutionInfo,
    } as PendingChildExecutionInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowId = reader.string();
          break;
        case 2:
          message.runId = reader.string();
          break;
        case 3:
          message.workflowTypeName = reader.string();
          break;
        case 4:
          message.initiatedId = longToNumber(reader.int64() as Long);
          break;
        case 5:
          message.parentClosePolicy = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PendingChildExecutionInfo {
    const message = {
      ...basePendingChildExecutionInfo,
    } as PendingChildExecutionInfo;
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
    if (
      object.workflowTypeName !== undefined &&
      object.workflowTypeName !== null
    ) {
      message.workflowTypeName = String(object.workflowTypeName);
    } else {
      message.workflowTypeName = '';
    }
    if (object.initiatedId !== undefined && object.initiatedId !== null) {
      message.initiatedId = Number(object.initiatedId);
    } else {
      message.initiatedId = 0;
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
    return message;
  },

  toJSON(message: PendingChildExecutionInfo): unknown {
    const obj: any = {};
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    message.workflowTypeName !== undefined &&
      (obj.workflowTypeName = message.workflowTypeName);
    message.initiatedId !== undefined &&
      (obj.initiatedId = message.initiatedId);
    message.parentClosePolicy !== undefined &&
      (obj.parentClosePolicy = parentClosePolicyToJSON(
        message.parentClosePolicy,
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<PendingChildExecutionInfo>,
  ): PendingChildExecutionInfo {
    const message = {
      ...basePendingChildExecutionInfo,
    } as PendingChildExecutionInfo;
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
    if (
      object.workflowTypeName !== undefined &&
      object.workflowTypeName !== null
    ) {
      message.workflowTypeName = object.workflowTypeName;
    } else {
      message.workflowTypeName = '';
    }
    if (object.initiatedId !== undefined && object.initiatedId !== null) {
      message.initiatedId = object.initiatedId;
    } else {
      message.initiatedId = 0;
    }
    if (
      object.parentClosePolicy !== undefined &&
      object.parentClosePolicy !== null
    ) {
      message.parentClosePolicy = object.parentClosePolicy;
    } else {
      message.parentClosePolicy = 0;
    }
    return message;
  },
};

const baseResetPoints: object = {};

export const ResetPoints = {
  encode(
    message: ResetPoints,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.points) {
      ResetPointInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResetPoints {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseResetPoints } as ResetPoints;
    message.points = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.points.push(ResetPointInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResetPoints {
    const message = { ...baseResetPoints } as ResetPoints;
    message.points = [];
    if (object.points !== undefined && object.points !== null) {
      for (const e of object.points) {
        message.points.push(ResetPointInfo.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: ResetPoints): unknown {
    const obj: any = {};
    if (message.points) {
      obj.points = message.points.map((e) =>
        e ? ResetPointInfo.toJSON(e) : undefined,
      );
    } else {
      obj.points = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<ResetPoints>): ResetPoints {
    const message = { ...baseResetPoints } as ResetPoints;
    message.points = [];
    if (object.points !== undefined && object.points !== null) {
      for (const e of object.points) {
        message.points.push(ResetPointInfo.fromPartial(e));
      }
    }
    return message;
  },
};

const baseResetPointInfo: object = {
  binaryChecksum: '',
  runId: '',
  firstWorkflowTaskCompletedId: 0,
  resettable: false,
};

export const ResetPointInfo = {
  encode(
    message: ResetPointInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.binaryChecksum !== '') {
      writer.uint32(10).string(message.binaryChecksum);
    }
    if (message.runId !== '') {
      writer.uint32(18).string(message.runId);
    }
    if (message.firstWorkflowTaskCompletedId !== 0) {
      writer.uint32(24).int64(message.firstWorkflowTaskCompletedId);
    }
    if (message.createTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.createTime),
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.expireTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.expireTime),
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.resettable === true) {
      writer.uint32(48).bool(message.resettable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResetPointInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseResetPointInfo } as ResetPointInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.binaryChecksum = reader.string();
          break;
        case 2:
          message.runId = reader.string();
          break;
        case 3:
          message.firstWorkflowTaskCompletedId = longToNumber(
            reader.int64() as Long,
          );
          break;
        case 4:
          message.createTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 5:
          message.expireTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 6:
          message.resettable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ResetPointInfo {
    const message = { ...baseResetPointInfo } as ResetPointInfo;
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = String(object.binaryChecksum);
    } else {
      message.binaryChecksum = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    if (
      object.firstWorkflowTaskCompletedId !== undefined &&
      object.firstWorkflowTaskCompletedId !== null
    ) {
      message.firstWorkflowTaskCompletedId = Number(
        object.firstWorkflowTaskCompletedId,
      );
    } else {
      message.firstWorkflowTaskCompletedId = 0;
    }
    if (object.createTime !== undefined && object.createTime !== null) {
      message.createTime = fromJsonTimestamp(object.createTime);
    } else {
      message.createTime = undefined;
    }
    if (object.expireTime !== undefined && object.expireTime !== null) {
      message.expireTime = fromJsonTimestamp(object.expireTime);
    } else {
      message.expireTime = undefined;
    }
    if (object.resettable !== undefined && object.resettable !== null) {
      message.resettable = Boolean(object.resettable);
    } else {
      message.resettable = false;
    }
    return message;
  },

  toJSON(message: ResetPointInfo): unknown {
    const obj: any = {};
    message.binaryChecksum !== undefined &&
      (obj.binaryChecksum = message.binaryChecksum);
    message.runId !== undefined && (obj.runId = message.runId);
    message.firstWorkflowTaskCompletedId !== undefined &&
      (obj.firstWorkflowTaskCompletedId = message.firstWorkflowTaskCompletedId);
    message.createTime !== undefined &&
      (obj.createTime = message.createTime.toISOString());
    message.expireTime !== undefined &&
      (obj.expireTime = message.expireTime.toISOString());
    message.resettable !== undefined && (obj.resettable = message.resettable);
    return obj;
  },

  fromPartial(object: DeepPartial<ResetPointInfo>): ResetPointInfo {
    const message = { ...baseResetPointInfo } as ResetPointInfo;
    if (object.binaryChecksum !== undefined && object.binaryChecksum !== null) {
      message.binaryChecksum = object.binaryChecksum;
    } else {
      message.binaryChecksum = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    if (
      object.firstWorkflowTaskCompletedId !== undefined &&
      object.firstWorkflowTaskCompletedId !== null
    ) {
      message.firstWorkflowTaskCompletedId =
        object.firstWorkflowTaskCompletedId;
    } else {
      message.firstWorkflowTaskCompletedId = 0;
    }
    if (object.createTime !== undefined && object.createTime !== null) {
      message.createTime = object.createTime;
    } else {
      message.createTime = undefined;
    }
    if (object.expireTime !== undefined && object.expireTime !== null) {
      message.expireTime = object.expireTime;
    } else {
      message.expireTime = undefined;
    }
    if (object.resettable !== undefined && object.resettable !== null) {
      message.resettable = object.resettable;
    } else {
      message.resettable = false;
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
