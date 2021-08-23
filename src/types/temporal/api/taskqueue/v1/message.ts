/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  TaskQueueKind,
  taskQueueKindFromJSON,
  taskQueueKindToJSON,
} from '../../../../temporal/api/enums/v1/task_queue';
import { Timestamp } from '../../../../google/protobuf/timestamp';
import { Duration } from '../../../../google/protobuf/duration';
import { DoubleValue } from '../../../../google/protobuf/wrappers';

export const protobufPackage = 'temporal.api.taskqueue.v1';

export interface TaskQueue {
  name: string;
  /** Default: TASK_QUEUE_KIND_NORMAL. */
  kind: TaskQueueKind;
}

export interface TaskQueueMetadata {
  maxTasksPerSecond: number | undefined;
}

export interface TaskQueueStatus {
  backlogCountHint: number;
  readLevel: number;
  ackLevel: number;
  ratePerSecond: number;
  taskIdBlock: TaskIdBlock | undefined;
}

export interface TaskIdBlock {
  startId: number;
  endId: number;
}

export interface TaskQueuePartitionMetadata {
  key: string;
  ownerHostName: string;
}

export interface PollerInfo {
  /** Unix Nano */
  lastAccessTime: Date | undefined;
  identity: string;
  ratePerSecond: number;
}

export type GetPollerRequest = {
  pollers: PollerInfo[];
  taskQueueStatus: TaskQueueStatus;
};

export interface StickyExecutionAttributes {
  workerTaskQueue: TaskQueue | undefined;
  /**
   * (-- api-linter: core::0140::prepositions=disabled
   *     aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  scheduleToStartTimeout: Duration | undefined;
}

const baseTaskQueue: object = { name: '', kind: 0 };

export const TaskQueue = {
  encode(
    message: TaskQueue,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.kind !== 0) {
      writer.uint32(16).int32(message.kind);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TaskQueue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseTaskQueue } as TaskQueue;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.kind = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TaskQueue {
    const message = { ...baseTaskQueue } as TaskQueue;
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = '';
    }
    if (object.kind !== undefined && object.kind !== null) {
      message.kind = taskQueueKindFromJSON(object.kind);
    } else {
      message.kind = 0;
    }
    return message;
  },

  toJSON(message: TaskQueue): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.kind !== undefined &&
      (obj.kind = taskQueueKindToJSON(message.kind));
    return obj;
  },

  fromPartial(object: DeepPartial<TaskQueue>): TaskQueue {
    const message = { ...baseTaskQueue } as TaskQueue;
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = '';
    }
    if (object.kind !== undefined && object.kind !== null) {
      message.kind = object.kind;
    } else {
      message.kind = 0;
    }
    return message;
  },
};

const baseTaskQueueMetadata: object = {};

export const TaskQueueMetadata = {
  encode(
    message: TaskQueueMetadata,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.maxTasksPerSecond !== undefined) {
      DoubleValue.encode(
        { value: message.maxTasksPerSecond! },
        writer.uint32(10).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TaskQueueMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseTaskQueueMetadata } as TaskQueueMetadata;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maxTasksPerSecond = DoubleValue.decode(
            reader,
            reader.uint32(),
          ).value;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TaskQueueMetadata {
    const message = { ...baseTaskQueueMetadata } as TaskQueueMetadata;
    if (
      object.maxTasksPerSecond !== undefined &&
      object.maxTasksPerSecond !== null
    ) {
      message.maxTasksPerSecond = Number(object.maxTasksPerSecond);
    } else {
      message.maxTasksPerSecond = undefined;
    }
    return message;
  },

  toJSON(message: TaskQueueMetadata): unknown {
    const obj: any = {};
    message.maxTasksPerSecond !== undefined &&
      (obj.maxTasksPerSecond = message.maxTasksPerSecond);
    return obj;
  },

  fromPartial(object: DeepPartial<TaskQueueMetadata>): TaskQueueMetadata {
    const message = { ...baseTaskQueueMetadata } as TaskQueueMetadata;
    if (
      object.maxTasksPerSecond !== undefined &&
      object.maxTasksPerSecond !== null
    ) {
      message.maxTasksPerSecond = object.maxTasksPerSecond;
    } else {
      message.maxTasksPerSecond = undefined;
    }
    return message;
  },
};

const baseTaskQueueStatus: object = {
  backlogCountHint: 0,
  readLevel: 0,
  ackLevel: 0,
  ratePerSecond: 0,
};

export const TaskQueueStatus = {
  encode(
    message: TaskQueueStatus,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.backlogCountHint !== 0) {
      writer.uint32(8).int64(message.backlogCountHint);
    }
    if (message.readLevel !== 0) {
      writer.uint32(16).int64(message.readLevel);
    }
    if (message.ackLevel !== 0) {
      writer.uint32(24).int64(message.ackLevel);
    }
    if (message.ratePerSecond !== 0) {
      writer.uint32(33).double(message.ratePerSecond);
    }
    if (message.taskIdBlock !== undefined) {
      TaskIdBlock.encode(
        message.taskIdBlock,
        writer.uint32(42).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TaskQueueStatus {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseTaskQueueStatus } as TaskQueueStatus;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.backlogCountHint = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.readLevel = longToNumber(reader.int64() as Long);
          break;
        case 3:
          message.ackLevel = longToNumber(reader.int64() as Long);
          break;
        case 4:
          message.ratePerSecond = reader.double();
          break;
        case 5:
          message.taskIdBlock = TaskIdBlock.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TaskQueueStatus {
    const message = { ...baseTaskQueueStatus } as TaskQueueStatus;
    if (
      object.backlogCountHint !== undefined &&
      object.backlogCountHint !== null
    ) {
      message.backlogCountHint = Number(object.backlogCountHint);
    } else {
      message.backlogCountHint = 0;
    }
    if (object.readLevel !== undefined && object.readLevel !== null) {
      message.readLevel = Number(object.readLevel);
    } else {
      message.readLevel = 0;
    }
    if (object.ackLevel !== undefined && object.ackLevel !== null) {
      message.ackLevel = Number(object.ackLevel);
    } else {
      message.ackLevel = 0;
    }
    if (object.ratePerSecond !== undefined && object.ratePerSecond !== null) {
      message.ratePerSecond = Number(object.ratePerSecond);
    } else {
      message.ratePerSecond = 0;
    }
    if (object.taskIdBlock !== undefined && object.taskIdBlock !== null) {
      message.taskIdBlock = TaskIdBlock.fromJSON(object.taskIdBlock);
    } else {
      message.taskIdBlock = undefined;
    }
    return message;
  },

  toJSON(message: TaskQueueStatus): unknown {
    const obj: any = {};
    message.backlogCountHint !== undefined &&
      (obj.backlogCountHint = message.backlogCountHint);
    message.readLevel !== undefined && (obj.readLevel = message.readLevel);
    message.ackLevel !== undefined && (obj.ackLevel = message.ackLevel);
    message.ratePerSecond !== undefined &&
      (obj.ratePerSecond = message.ratePerSecond);
    message.taskIdBlock !== undefined &&
      (obj.taskIdBlock = message.taskIdBlock
        ? TaskIdBlock.toJSON(message.taskIdBlock)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<TaskQueueStatus>): TaskQueueStatus {
    const message = { ...baseTaskQueueStatus } as TaskQueueStatus;
    if (
      object.backlogCountHint !== undefined &&
      object.backlogCountHint !== null
    ) {
      message.backlogCountHint = object.backlogCountHint;
    } else {
      message.backlogCountHint = 0;
    }
    if (object.readLevel !== undefined && object.readLevel !== null) {
      message.readLevel = object.readLevel;
    } else {
      message.readLevel = 0;
    }
    if (object.ackLevel !== undefined && object.ackLevel !== null) {
      message.ackLevel = object.ackLevel;
    } else {
      message.ackLevel = 0;
    }
    if (object.ratePerSecond !== undefined && object.ratePerSecond !== null) {
      message.ratePerSecond = object.ratePerSecond;
    } else {
      message.ratePerSecond = 0;
    }
    if (object.taskIdBlock !== undefined && object.taskIdBlock !== null) {
      message.taskIdBlock = TaskIdBlock.fromPartial(object.taskIdBlock);
    } else {
      message.taskIdBlock = undefined;
    }
    return message;
  },
};

const baseTaskIdBlock: object = { startId: 0, endId: 0 };

export const TaskIdBlock = {
  encode(
    message: TaskIdBlock,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.startId !== 0) {
      writer.uint32(8).int64(message.startId);
    }
    if (message.endId !== 0) {
      writer.uint32(16).int64(message.endId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TaskIdBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseTaskIdBlock } as TaskIdBlock;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.startId = longToNumber(reader.int64() as Long);
          break;
        case 2:
          message.endId = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TaskIdBlock {
    const message = { ...baseTaskIdBlock } as TaskIdBlock;
    if (object.startId !== undefined && object.startId !== null) {
      message.startId = Number(object.startId);
    } else {
      message.startId = 0;
    }
    if (object.endId !== undefined && object.endId !== null) {
      message.endId = Number(object.endId);
    } else {
      message.endId = 0;
    }
    return message;
  },

  toJSON(message: TaskIdBlock): unknown {
    const obj: any = {};
    message.startId !== undefined && (obj.startId = message.startId);
    message.endId !== undefined && (obj.endId = message.endId);
    return obj;
  },

  fromPartial(object: DeepPartial<TaskIdBlock>): TaskIdBlock {
    const message = { ...baseTaskIdBlock } as TaskIdBlock;
    if (object.startId !== undefined && object.startId !== null) {
      message.startId = object.startId;
    } else {
      message.startId = 0;
    }
    if (object.endId !== undefined && object.endId !== null) {
      message.endId = object.endId;
    } else {
      message.endId = 0;
    }
    return message;
  },
};

const baseTaskQueuePartitionMetadata: object = { key: '', ownerHostName: '' };

export const TaskQueuePartitionMetadata = {
  encode(
    message: TaskQueuePartitionMetadata,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.ownerHostName !== '') {
      writer.uint32(18).string(message.ownerHostName);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TaskQueuePartitionMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseTaskQueuePartitionMetadata,
    } as TaskQueuePartitionMetadata;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.ownerHostName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TaskQueuePartitionMetadata {
    const message = {
      ...baseTaskQueuePartitionMetadata,
    } as TaskQueuePartitionMetadata;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.ownerHostName !== undefined && object.ownerHostName !== null) {
      message.ownerHostName = String(object.ownerHostName);
    } else {
      message.ownerHostName = '';
    }
    return message;
  },

  toJSON(message: TaskQueuePartitionMetadata): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.ownerHostName !== undefined &&
      (obj.ownerHostName = message.ownerHostName);
    return obj;
  },

  fromPartial(
    object: DeepPartial<TaskQueuePartitionMetadata>,
  ): TaskQueuePartitionMetadata {
    const message = {
      ...baseTaskQueuePartitionMetadata,
    } as TaskQueuePartitionMetadata;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.ownerHostName !== undefined && object.ownerHostName !== null) {
      message.ownerHostName = object.ownerHostName;
    } else {
      message.ownerHostName = '';
    }
    return message;
  },
};

const basePollerInfo: object = { identity: '', ratePerSecond: 0 };

export const PollerInfo = {
  encode(
    message: PollerInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.lastAccessTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastAccessTime),
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.identity !== '') {
      writer.uint32(18).string(message.identity);
    }
    if (message.ratePerSecond !== 0) {
      writer.uint32(25).double(message.ratePerSecond);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PollerInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...basePollerInfo } as PollerInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lastAccessTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.identity = reader.string();
          break;
        case 3:
          message.ratePerSecond = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PollerInfo {
    const message = { ...basePollerInfo } as PollerInfo;
    if (object.lastAccessTime !== undefined && object.lastAccessTime !== null) {
      message.lastAccessTime = fromJsonTimestamp(object.lastAccessTime);
    } else {
      message.lastAccessTime = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = String(object.identity);
    } else {
      message.identity = '';
    }
    if (object.ratePerSecond !== undefined && object.ratePerSecond !== null) {
      message.ratePerSecond = Number(object.ratePerSecond);
    } else {
      message.ratePerSecond = 0;
    }
    return message;
  },

  toJSON(message: PollerInfo): unknown {
    const obj: any = {};
    message.lastAccessTime !== undefined &&
      (obj.lastAccessTime = message.lastAccessTime.toISOString());
    message.identity !== undefined && (obj.identity = message.identity);
    message.ratePerSecond !== undefined &&
      (obj.ratePerSecond = message.ratePerSecond);
    return obj;
  },

  fromPartial(object: DeepPartial<PollerInfo>): PollerInfo {
    const message = { ...basePollerInfo } as PollerInfo;
    if (object.lastAccessTime !== undefined && object.lastAccessTime !== null) {
      message.lastAccessTime = object.lastAccessTime;
    } else {
      message.lastAccessTime = undefined;
    }
    if (object.identity !== undefined && object.identity !== null) {
      message.identity = object.identity;
    } else {
      message.identity = '';
    }
    if (object.ratePerSecond !== undefined && object.ratePerSecond !== null) {
      message.ratePerSecond = object.ratePerSecond;
    } else {
      message.ratePerSecond = 0;
    }
    return message;
  },
};

const baseStickyExecutionAttributes: object = {};

export const StickyExecutionAttributes = {
  encode(
    message: StickyExecutionAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workerTaskQueue !== undefined) {
      TaskQueue.encode(
        message.workerTaskQueue,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.scheduleToStartTimeout !== undefined) {
      Duration.encode(
        message.scheduleToStartTimeout,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): StickyExecutionAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseStickyExecutionAttributes,
    } as StickyExecutionAttributes;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workerTaskQueue = TaskQueue.decode(reader, reader.uint32());
          break;
        case 2:
          message.scheduleToStartTimeout = Duration.decode(
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

  fromJSON(object: any): StickyExecutionAttributes {
    const message = {
      ...baseStickyExecutionAttributes,
    } as StickyExecutionAttributes;
    if (
      object.workerTaskQueue !== undefined &&
      object.workerTaskQueue !== null
    ) {
      message.workerTaskQueue = TaskQueue.fromJSON(object.workerTaskQueue);
    } else {
      message.workerTaskQueue = undefined;
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
    return message;
  },

  toJSON(message: StickyExecutionAttributes): unknown {
    const obj: any = {};
    message.workerTaskQueue !== undefined &&
      (obj.workerTaskQueue = message.workerTaskQueue
        ? TaskQueue.toJSON(message.workerTaskQueue)
        : undefined);
    message.scheduleToStartTimeout !== undefined &&
      (obj.scheduleToStartTimeout = message.scheduleToStartTimeout
        ? Duration.toJSON(message.scheduleToStartTimeout)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<StickyExecutionAttributes>,
  ): StickyExecutionAttributes {
    const message = {
      ...baseStickyExecutionAttributes,
    } as StickyExecutionAttributes;
    if (
      object.workerTaskQueue !== undefined &&
      object.workerTaskQueue !== null
    ) {
      message.workerTaskQueue = TaskQueue.fromPartial(object.workerTaskQueue);
    } else {
      message.workerTaskQueue = undefined;
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
