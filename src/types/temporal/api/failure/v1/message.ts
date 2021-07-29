/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  TimeoutType,
  RetryState,
  timeoutTypeFromJSON,
  timeoutTypeToJSON,
  retryStateFromJSON,
  retryStateToJSON,
} from '../../../../temporal/api/enums/v1/workflow';
import {
  Payloads,
  ActivityType,
  WorkflowExecution,
  WorkflowType,
} from '../../../../temporal/api/common/v1/message';

export const protobufPackage = 'temporal.api.failure.v1';

export interface ApplicationFailureInfo {
  type: string;
  nonRetryable: boolean;
  details: Payloads | undefined;
}

export interface TimeoutFailureInfo {
  timeoutType: TimeoutType;
  lastHeartbeatDetails: Payloads | undefined;
}

export interface CanceledFailureInfo {
  details: Payloads | undefined;
}

export interface TerminatedFailureInfo {}

export interface ServerFailureInfo {
  nonRetryable: boolean;
}

export interface ResetWorkflowFailureInfo {
  lastHeartbeatDetails: Payloads | undefined;
}

export interface ActivityFailureInfo {
  scheduledEventId: number;
  startedEventId: number;
  identity: string;
  activityType: ActivityType | undefined;
  activityId: string;
  retryState: RetryState;
}

export interface ChildWorkflowExecutionFailureInfo {
  namespace: string;
  workflowExecution: WorkflowExecution | undefined;
  workflowType: WorkflowType | undefined;
  initiatedEventId: number;
  startedEventId: number;
  retryState: RetryState;
}

export interface Failure {
  message: string;
  source: string;
  stackTrace: string;
  cause: Failure | undefined;
  applicationFailureInfo: ApplicationFailureInfo | undefined;
  timeoutFailureInfo: TimeoutFailureInfo | undefined;
  canceledFailureInfo: CanceledFailureInfo | undefined;
  terminatedFailureInfo: TerminatedFailureInfo | undefined;
  serverFailureInfo: ServerFailureInfo | undefined;
  resetWorkflowFailureInfo: ResetWorkflowFailureInfo | undefined;
  activityFailureInfo: ActivityFailureInfo | undefined;
  childWorkflowExecutionFailureInfo:
    | ChildWorkflowExecutionFailureInfo
    | undefined;
}

const baseApplicationFailureInfo: object = { type: '', nonRetryable: false };

export const ApplicationFailureInfo = {
  encode(
    message: ApplicationFailureInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.type !== '') {
      writer.uint32(10).string(message.type);
    }
    if (message.nonRetryable === true) {
      writer.uint32(16).bool(message.nonRetryable);
    }
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ApplicationFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseApplicationFailureInfo } as ApplicationFailureInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        case 2:
          message.nonRetryable = reader.bool();
          break;
        case 3:
          message.details = Payloads.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ApplicationFailureInfo {
    const message = { ...baseApplicationFailureInfo } as ApplicationFailureInfo;
    if (object.type !== undefined && object.type !== null) {
      message.type = String(object.type);
    } else {
      message.type = '';
    }
    if (object.nonRetryable !== undefined && object.nonRetryable !== null) {
      message.nonRetryable = Boolean(object.nonRetryable);
    } else {
      message.nonRetryable = false;
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },

  toJSON(message: ApplicationFailureInfo): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.nonRetryable !== undefined &&
      (obj.nonRetryable = message.nonRetryable);
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ApplicationFailureInfo>,
  ): ApplicationFailureInfo {
    const message = { ...baseApplicationFailureInfo } as ApplicationFailureInfo;
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    } else {
      message.type = '';
    }
    if (object.nonRetryable !== undefined && object.nonRetryable !== null) {
      message.nonRetryable = object.nonRetryable;
    } else {
      message.nonRetryable = false;
    }
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },
};

const baseTimeoutFailureInfo: object = { timeoutType: 0 };

export const TimeoutFailureInfo = {
  encode(
    message: TimeoutFailureInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.timeoutType !== 0) {
      writer.uint32(8).int32(message.timeoutType);
    }
    if (message.lastHeartbeatDetails !== undefined) {
      Payloads.encode(
        message.lastHeartbeatDetails,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimeoutFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseTimeoutFailureInfo } as TimeoutFailureInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timeoutType = reader.int32() as any;
          break;
        case 2:
          message.lastHeartbeatDetails = Payloads.decode(
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

  fromJSON(object: any): TimeoutFailureInfo {
    const message = { ...baseTimeoutFailureInfo } as TimeoutFailureInfo;
    if (object.timeoutType !== undefined && object.timeoutType !== null) {
      message.timeoutType = timeoutTypeFromJSON(object.timeoutType);
    } else {
      message.timeoutType = 0;
    }
    if (
      object.lastHeartbeatDetails !== undefined &&
      object.lastHeartbeatDetails !== null
    ) {
      message.lastHeartbeatDetails = Payloads.fromJSON(
        object.lastHeartbeatDetails,
      );
    } else {
      message.lastHeartbeatDetails = undefined;
    }
    return message;
  },

  toJSON(message: TimeoutFailureInfo): unknown {
    const obj: any = {};
    message.timeoutType !== undefined &&
      (obj.timeoutType = timeoutTypeToJSON(message.timeoutType));
    message.lastHeartbeatDetails !== undefined &&
      (obj.lastHeartbeatDetails = message.lastHeartbeatDetails
        ? Payloads.toJSON(message.lastHeartbeatDetails)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<TimeoutFailureInfo>): TimeoutFailureInfo {
    const message = { ...baseTimeoutFailureInfo } as TimeoutFailureInfo;
    if (object.timeoutType !== undefined && object.timeoutType !== null) {
      message.timeoutType = object.timeoutType;
    } else {
      message.timeoutType = 0;
    }
    if (
      object.lastHeartbeatDetails !== undefined &&
      object.lastHeartbeatDetails !== null
    ) {
      message.lastHeartbeatDetails = Payloads.fromPartial(
        object.lastHeartbeatDetails,
      );
    } else {
      message.lastHeartbeatDetails = undefined;
    }
    return message;
  },
};

const baseCanceledFailureInfo: object = {};

export const CanceledFailureInfo = {
  encode(
    message: CanceledFailureInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.details !== undefined) {
      Payloads.encode(message.details, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CanceledFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCanceledFailureInfo } as CanceledFailureInfo;
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

  fromJSON(object: any): CanceledFailureInfo {
    const message = { ...baseCanceledFailureInfo } as CanceledFailureInfo;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromJSON(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },

  toJSON(message: CanceledFailureInfo): unknown {
    const obj: any = {};
    message.details !== undefined &&
      (obj.details = message.details
        ? Payloads.toJSON(message.details)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<CanceledFailureInfo>): CanceledFailureInfo {
    const message = { ...baseCanceledFailureInfo } as CanceledFailureInfo;
    if (object.details !== undefined && object.details !== null) {
      message.details = Payloads.fromPartial(object.details);
    } else {
      message.details = undefined;
    }
    return message;
  },
};

const baseTerminatedFailureInfo: object = {};

export const TerminatedFailureInfo = {
  encode(
    _: TerminatedFailureInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TerminatedFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseTerminatedFailureInfo } as TerminatedFailureInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): TerminatedFailureInfo {
    const message = { ...baseTerminatedFailureInfo } as TerminatedFailureInfo;
    return message;
  },

  toJSON(_: TerminatedFailureInfo): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<TerminatedFailureInfo>): TerminatedFailureInfo {
    const message = { ...baseTerminatedFailureInfo } as TerminatedFailureInfo;
    return message;
  },
};

const baseServerFailureInfo: object = { nonRetryable: false };

export const ServerFailureInfo = {
  encode(
    message: ServerFailureInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.nonRetryable === true) {
      writer.uint32(8).bool(message.nonRetryable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ServerFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseServerFailureInfo } as ServerFailureInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nonRetryable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ServerFailureInfo {
    const message = { ...baseServerFailureInfo } as ServerFailureInfo;
    if (object.nonRetryable !== undefined && object.nonRetryable !== null) {
      message.nonRetryable = Boolean(object.nonRetryable);
    } else {
      message.nonRetryable = false;
    }
    return message;
  },

  toJSON(message: ServerFailureInfo): unknown {
    const obj: any = {};
    message.nonRetryable !== undefined &&
      (obj.nonRetryable = message.nonRetryable);
    return obj;
  },

  fromPartial(object: DeepPartial<ServerFailureInfo>): ServerFailureInfo {
    const message = { ...baseServerFailureInfo } as ServerFailureInfo;
    if (object.nonRetryable !== undefined && object.nonRetryable !== null) {
      message.nonRetryable = object.nonRetryable;
    } else {
      message.nonRetryable = false;
    }
    return message;
  },
};

const baseResetWorkflowFailureInfo: object = {};

export const ResetWorkflowFailureInfo = {
  encode(
    message: ResetWorkflowFailureInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.lastHeartbeatDetails !== undefined) {
      Payloads.encode(
        message.lastHeartbeatDetails,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ResetWorkflowFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseResetWorkflowFailureInfo,
    } as ResetWorkflowFailureInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lastHeartbeatDetails = Payloads.decode(
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

  fromJSON(object: any): ResetWorkflowFailureInfo {
    const message = {
      ...baseResetWorkflowFailureInfo,
    } as ResetWorkflowFailureInfo;
    if (
      object.lastHeartbeatDetails !== undefined &&
      object.lastHeartbeatDetails !== null
    ) {
      message.lastHeartbeatDetails = Payloads.fromJSON(
        object.lastHeartbeatDetails,
      );
    } else {
      message.lastHeartbeatDetails = undefined;
    }
    return message;
  },

  toJSON(message: ResetWorkflowFailureInfo): unknown {
    const obj: any = {};
    message.lastHeartbeatDetails !== undefined &&
      (obj.lastHeartbeatDetails = message.lastHeartbeatDetails
        ? Payloads.toJSON(message.lastHeartbeatDetails)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ResetWorkflowFailureInfo>,
  ): ResetWorkflowFailureInfo {
    const message = {
      ...baseResetWorkflowFailureInfo,
    } as ResetWorkflowFailureInfo;
    if (
      object.lastHeartbeatDetails !== undefined &&
      object.lastHeartbeatDetails !== null
    ) {
      message.lastHeartbeatDetails = Payloads.fromPartial(
        object.lastHeartbeatDetails,
      );
    } else {
      message.lastHeartbeatDetails = undefined;
    }
    return message;
  },
};

const baseActivityFailureInfo: object = {
  scheduledEventId: 0,
  startedEventId: 0,
  identity: '',
  activityId: '',
  retryState: 0,
};

export const ActivityFailureInfo = {
  encode(
    message: ActivityFailureInfo,
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
    if (message.activityType !== undefined) {
      ActivityType.encode(
        message.activityType,
        writer.uint32(34).fork(),
      ).ldelim();
    }
    if (message.activityId !== '') {
      writer.uint32(42).string(message.activityId);
    }
    if (message.retryState !== 0) {
      writer.uint32(48).int32(message.retryState);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ActivityFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseActivityFailureInfo } as ActivityFailureInfo;
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
          message.activityType = ActivityType.decode(reader, reader.uint32());
          break;
        case 5:
          message.activityId = reader.string();
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

  fromJSON(object: any): ActivityFailureInfo {
    const message = { ...baseActivityFailureInfo } as ActivityFailureInfo;
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
    if (object.activityType !== undefined && object.activityType !== null) {
      message.activityType = ActivityType.fromJSON(object.activityType);
    } else {
      message.activityType = undefined;
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = String(object.activityId);
    } else {
      message.activityId = '';
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = retryStateFromJSON(object.retryState);
    } else {
      message.retryState = 0;
    }
    return message;
  },

  toJSON(message: ActivityFailureInfo): unknown {
    const obj: any = {};
    message.scheduledEventId !== undefined &&
      (obj.scheduledEventId = message.scheduledEventId);
    message.startedEventId !== undefined &&
      (obj.startedEventId = message.startedEventId);
    message.identity !== undefined && (obj.identity = message.identity);
    message.activityType !== undefined &&
      (obj.activityType = message.activityType
        ? ActivityType.toJSON(message.activityType)
        : undefined);
    message.activityId !== undefined && (obj.activityId = message.activityId);
    message.retryState !== undefined &&
      (obj.retryState = retryStateToJSON(message.retryState));
    return obj;
  },

  fromPartial(object: DeepPartial<ActivityFailureInfo>): ActivityFailureInfo {
    const message = { ...baseActivityFailureInfo } as ActivityFailureInfo;
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
    if (object.activityType !== undefined && object.activityType !== null) {
      message.activityType = ActivityType.fromPartial(object.activityType);
    } else {
      message.activityType = undefined;
    }
    if (object.activityId !== undefined && object.activityId !== null) {
      message.activityId = object.activityId;
    } else {
      message.activityId = '';
    }
    if (object.retryState !== undefined && object.retryState !== null) {
      message.retryState = object.retryState;
    } else {
      message.retryState = 0;
    }
    return message;
  },
};

const baseChildWorkflowExecutionFailureInfo: object = {
  namespace: '',
  initiatedEventId: 0,
  startedEventId: 0,
  retryState: 0,
};

export const ChildWorkflowExecutionFailureInfo = {
  encode(
    message: ChildWorkflowExecutionFailureInfo,
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
  ): ChildWorkflowExecutionFailureInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseChildWorkflowExecutionFailureInfo,
    } as ChildWorkflowExecutionFailureInfo;
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

  fromJSON(object: any): ChildWorkflowExecutionFailureInfo {
    const message = {
      ...baseChildWorkflowExecutionFailureInfo,
    } as ChildWorkflowExecutionFailureInfo;
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

  toJSON(message: ChildWorkflowExecutionFailureInfo): unknown {
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
    object: DeepPartial<ChildWorkflowExecutionFailureInfo>,
  ): ChildWorkflowExecutionFailureInfo {
    const message = {
      ...baseChildWorkflowExecutionFailureInfo,
    } as ChildWorkflowExecutionFailureInfo;
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

const baseFailure: object = { message: '', source: '', stackTrace: '' };

export const Failure = {
  encode(
    message: Failure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.message !== '') {
      writer.uint32(10).string(message.message);
    }
    if (message.source !== '') {
      writer.uint32(18).string(message.source);
    }
    if (message.stackTrace !== '') {
      writer.uint32(26).string(message.stackTrace);
    }
    if (message.cause !== undefined) {
      Failure.encode(message.cause, writer.uint32(34).fork()).ldelim();
    }
    if (message.applicationFailureInfo !== undefined) {
      ApplicationFailureInfo.encode(
        message.applicationFailureInfo,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    if (message.timeoutFailureInfo !== undefined) {
      TimeoutFailureInfo.encode(
        message.timeoutFailureInfo,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.canceledFailureInfo !== undefined) {
      CanceledFailureInfo.encode(
        message.canceledFailureInfo,
        writer.uint32(58).fork(),
      ).ldelim();
    }
    if (message.terminatedFailureInfo !== undefined) {
      TerminatedFailureInfo.encode(
        message.terminatedFailureInfo,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.serverFailureInfo !== undefined) {
      ServerFailureInfo.encode(
        message.serverFailureInfo,
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.resetWorkflowFailureInfo !== undefined) {
      ResetWorkflowFailureInfo.encode(
        message.resetWorkflowFailureInfo,
        writer.uint32(82).fork(),
      ).ldelim();
    }
    if (message.activityFailureInfo !== undefined) {
      ActivityFailureInfo.encode(
        message.activityFailureInfo,
        writer.uint32(90).fork(),
      ).ldelim();
    }
    if (message.childWorkflowExecutionFailureInfo !== undefined) {
      ChildWorkflowExecutionFailureInfo.encode(
        message.childWorkflowExecutionFailureInfo,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Failure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseFailure } as Failure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.source = reader.string();
          break;
        case 3:
          message.stackTrace = reader.string();
          break;
        case 4:
          message.cause = Failure.decode(reader, reader.uint32());
          break;
        case 5:
          message.applicationFailureInfo = ApplicationFailureInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 6:
          message.timeoutFailureInfo = TimeoutFailureInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.canceledFailureInfo = CanceledFailureInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 8:
          message.terminatedFailureInfo = TerminatedFailureInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.serverFailureInfo = ServerFailureInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 10:
          message.resetWorkflowFailureInfo = ResetWorkflowFailureInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 11:
          message.activityFailureInfo = ActivityFailureInfo.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 12:
          message.childWorkflowExecutionFailureInfo = ChildWorkflowExecutionFailureInfo.decode(
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

  fromJSON(object: any): Failure {
    const message = { ...baseFailure } as Failure;
    if (object.message !== undefined && object.message !== null) {
      message.message = String(object.message);
    } else {
      message.message = '';
    }
    if (object.source !== undefined && object.source !== null) {
      message.source = String(object.source);
    } else {
      message.source = '';
    }
    if (object.stackTrace !== undefined && object.stackTrace !== null) {
      message.stackTrace = String(object.stackTrace);
    } else {
      message.stackTrace = '';
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = Failure.fromJSON(object.cause);
    } else {
      message.cause = undefined;
    }
    if (
      object.applicationFailureInfo !== undefined &&
      object.applicationFailureInfo !== null
    ) {
      message.applicationFailureInfo = ApplicationFailureInfo.fromJSON(
        object.applicationFailureInfo,
      );
    } else {
      message.applicationFailureInfo = undefined;
    }
    if (
      object.timeoutFailureInfo !== undefined &&
      object.timeoutFailureInfo !== null
    ) {
      message.timeoutFailureInfo = TimeoutFailureInfo.fromJSON(
        object.timeoutFailureInfo,
      );
    } else {
      message.timeoutFailureInfo = undefined;
    }
    if (
      object.canceledFailureInfo !== undefined &&
      object.canceledFailureInfo !== null
    ) {
      message.canceledFailureInfo = CanceledFailureInfo.fromJSON(
        object.canceledFailureInfo,
      );
    } else {
      message.canceledFailureInfo = undefined;
    }
    if (
      object.terminatedFailureInfo !== undefined &&
      object.terminatedFailureInfo !== null
    ) {
      message.terminatedFailureInfo = TerminatedFailureInfo.fromJSON(
        object.terminatedFailureInfo,
      );
    } else {
      message.terminatedFailureInfo = undefined;
    }
    if (
      object.serverFailureInfo !== undefined &&
      object.serverFailureInfo !== null
    ) {
      message.serverFailureInfo = ServerFailureInfo.fromJSON(
        object.serverFailureInfo,
      );
    } else {
      message.serverFailureInfo = undefined;
    }
    if (
      object.resetWorkflowFailureInfo !== undefined &&
      object.resetWorkflowFailureInfo !== null
    ) {
      message.resetWorkflowFailureInfo = ResetWorkflowFailureInfo.fromJSON(
        object.resetWorkflowFailureInfo,
      );
    } else {
      message.resetWorkflowFailureInfo = undefined;
    }
    if (
      object.activityFailureInfo !== undefined &&
      object.activityFailureInfo !== null
    ) {
      message.activityFailureInfo = ActivityFailureInfo.fromJSON(
        object.activityFailureInfo,
      );
    } else {
      message.activityFailureInfo = undefined;
    }
    if (
      object.childWorkflowExecutionFailureInfo !== undefined &&
      object.childWorkflowExecutionFailureInfo !== null
    ) {
      message.childWorkflowExecutionFailureInfo = ChildWorkflowExecutionFailureInfo.fromJSON(
        object.childWorkflowExecutionFailureInfo,
      );
    } else {
      message.childWorkflowExecutionFailureInfo = undefined;
    }
    return message;
  },

  toJSON(message: Failure): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.source !== undefined && (obj.source = message.source);
    message.stackTrace !== undefined && (obj.stackTrace = message.stackTrace);
    message.cause !== undefined &&
      (obj.cause = message.cause ? Failure.toJSON(message.cause) : undefined);
    message.applicationFailureInfo !== undefined &&
      (obj.applicationFailureInfo = message.applicationFailureInfo
        ? ApplicationFailureInfo.toJSON(message.applicationFailureInfo)
        : undefined);
    message.timeoutFailureInfo !== undefined &&
      (obj.timeoutFailureInfo = message.timeoutFailureInfo
        ? TimeoutFailureInfo.toJSON(message.timeoutFailureInfo)
        : undefined);
    message.canceledFailureInfo !== undefined &&
      (obj.canceledFailureInfo = message.canceledFailureInfo
        ? CanceledFailureInfo.toJSON(message.canceledFailureInfo)
        : undefined);
    message.terminatedFailureInfo !== undefined &&
      (obj.terminatedFailureInfo = message.terminatedFailureInfo
        ? TerminatedFailureInfo.toJSON(message.terminatedFailureInfo)
        : undefined);
    message.serverFailureInfo !== undefined &&
      (obj.serverFailureInfo = message.serverFailureInfo
        ? ServerFailureInfo.toJSON(message.serverFailureInfo)
        : undefined);
    message.resetWorkflowFailureInfo !== undefined &&
      (obj.resetWorkflowFailureInfo = message.resetWorkflowFailureInfo
        ? ResetWorkflowFailureInfo.toJSON(message.resetWorkflowFailureInfo)
        : undefined);
    message.activityFailureInfo !== undefined &&
      (obj.activityFailureInfo = message.activityFailureInfo
        ? ActivityFailureInfo.toJSON(message.activityFailureInfo)
        : undefined);
    message.childWorkflowExecutionFailureInfo !== undefined &&
      (obj.childWorkflowExecutionFailureInfo = message.childWorkflowExecutionFailureInfo
        ? ChildWorkflowExecutionFailureInfo.toJSON(
            message.childWorkflowExecutionFailureInfo,
          )
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Failure>): Failure {
    const message = { ...baseFailure } as Failure;
    if (object.message !== undefined && object.message !== null) {
      message.message = object.message;
    } else {
      message.message = '';
    }
    if (object.source !== undefined && object.source !== null) {
      message.source = object.source;
    } else {
      message.source = '';
    }
    if (object.stackTrace !== undefined && object.stackTrace !== null) {
      message.stackTrace = object.stackTrace;
    } else {
      message.stackTrace = '';
    }
    if (object.cause !== undefined && object.cause !== null) {
      message.cause = Failure.fromPartial(object.cause);
    } else {
      message.cause = undefined;
    }
    if (
      object.applicationFailureInfo !== undefined &&
      object.applicationFailureInfo !== null
    ) {
      message.applicationFailureInfo = ApplicationFailureInfo.fromPartial(
        object.applicationFailureInfo,
      );
    } else {
      message.applicationFailureInfo = undefined;
    }
    if (
      object.timeoutFailureInfo !== undefined &&
      object.timeoutFailureInfo !== null
    ) {
      message.timeoutFailureInfo = TimeoutFailureInfo.fromPartial(
        object.timeoutFailureInfo,
      );
    } else {
      message.timeoutFailureInfo = undefined;
    }
    if (
      object.canceledFailureInfo !== undefined &&
      object.canceledFailureInfo !== null
    ) {
      message.canceledFailureInfo = CanceledFailureInfo.fromPartial(
        object.canceledFailureInfo,
      );
    } else {
      message.canceledFailureInfo = undefined;
    }
    if (
      object.terminatedFailureInfo !== undefined &&
      object.terminatedFailureInfo !== null
    ) {
      message.terminatedFailureInfo = TerminatedFailureInfo.fromPartial(
        object.terminatedFailureInfo,
      );
    } else {
      message.terminatedFailureInfo = undefined;
    }
    if (
      object.serverFailureInfo !== undefined &&
      object.serverFailureInfo !== null
    ) {
      message.serverFailureInfo = ServerFailureInfo.fromPartial(
        object.serverFailureInfo,
      );
    } else {
      message.serverFailureInfo = undefined;
    }
    if (
      object.resetWorkflowFailureInfo !== undefined &&
      object.resetWorkflowFailureInfo !== null
    ) {
      message.resetWorkflowFailureInfo = ResetWorkflowFailureInfo.fromPartial(
        object.resetWorkflowFailureInfo,
      );
    } else {
      message.resetWorkflowFailureInfo = undefined;
    }
    if (
      object.activityFailureInfo !== undefined &&
      object.activityFailureInfo !== null
    ) {
      message.activityFailureInfo = ActivityFailureInfo.fromPartial(
        object.activityFailureInfo,
      );
    } else {
      message.activityFailureInfo = undefined;
    }
    if (
      object.childWorkflowExecutionFailureInfo !== undefined &&
      object.childWorkflowExecutionFailureInfo !== null
    ) {
      message.childWorkflowExecutionFailureInfo = ChildWorkflowExecutionFailureInfo.fromPartial(
        object.childWorkflowExecutionFailureInfo,
      );
    } else {
      message.childWorkflowExecutionFailureInfo = undefined;
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
