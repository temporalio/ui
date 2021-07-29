/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  WorkflowExecutionStatus,
  workflowExecutionStatusFromJSON,
  workflowExecutionStatusToJSON,
} from '../../../../temporal/api/enums/v1/workflow';
import { Timestamp } from '../../../../google/protobuf/timestamp';

export const protobufPackage = 'temporal.api.filter.v1';

export interface WorkflowExecutionFilter {
  workflowId: string;
  runId: string;
}

export interface WorkflowTypeFilter {
  name: string;
}

export interface StartTimeFilter {
  earliestTime: Date | undefined;
  latestTime: Date | undefined;
}

export interface StatusFilter {
  status: WorkflowExecutionStatus;
}

const baseWorkflowExecutionFilter: object = { workflowId: '', runId: '' };

export const WorkflowExecutionFilter = {
  encode(
    message: WorkflowExecutionFilter,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowId !== '') {
      writer.uint32(10).string(message.workflowId);
    }
    if (message.runId !== '') {
      writer.uint32(18).string(message.runId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionFilter,
    } as WorkflowExecutionFilter;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowId = reader.string();
          break;
        case 2:
          message.runId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowExecutionFilter {
    const message = {
      ...baseWorkflowExecutionFilter,
    } as WorkflowExecutionFilter;
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
    return message;
  },

  toJSON(message: WorkflowExecutionFilter): unknown {
    const obj: any = {};
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionFilter>,
  ): WorkflowExecutionFilter {
    const message = {
      ...baseWorkflowExecutionFilter,
    } as WorkflowExecutionFilter;
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
    return message;
  },
};

const baseWorkflowTypeFilter: object = { name: '' };

export const WorkflowTypeFilter = {
  encode(
    message: WorkflowTypeFilter,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowTypeFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWorkflowTypeFilter } as WorkflowTypeFilter;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowTypeFilter {
    const message = { ...baseWorkflowTypeFilter } as WorkflowTypeFilter;
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = '';
    }
    return message;
  },

  toJSON(message: WorkflowTypeFilter): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial(object: DeepPartial<WorkflowTypeFilter>): WorkflowTypeFilter {
    const message = { ...baseWorkflowTypeFilter } as WorkflowTypeFilter;
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = '';
    }
    return message;
  },
};

const baseStartTimeFilter: object = {};

export const StartTimeFilter = {
  encode(
    message: StartTimeFilter,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.earliestTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.earliestTime),
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.latestTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.latestTime),
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StartTimeFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseStartTimeFilter } as StartTimeFilter;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.earliestTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.latestTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartTimeFilter {
    const message = { ...baseStartTimeFilter } as StartTimeFilter;
    if (object.earliestTime !== undefined && object.earliestTime !== null) {
      message.earliestTime = fromJsonTimestamp(object.earliestTime);
    } else {
      message.earliestTime = undefined;
    }
    if (object.latestTime !== undefined && object.latestTime !== null) {
      message.latestTime = fromJsonTimestamp(object.latestTime);
    } else {
      message.latestTime = undefined;
    }
    return message;
  },

  toJSON(message: StartTimeFilter): unknown {
    const obj: any = {};
    message.earliestTime !== undefined &&
      (obj.earliestTime = message.earliestTime.toISOString());
    message.latestTime !== undefined &&
      (obj.latestTime = message.latestTime.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<StartTimeFilter>): StartTimeFilter {
    const message = { ...baseStartTimeFilter } as StartTimeFilter;
    if (object.earliestTime !== undefined && object.earliestTime !== null) {
      message.earliestTime = object.earliestTime;
    } else {
      message.earliestTime = undefined;
    }
    if (object.latestTime !== undefined && object.latestTime !== null) {
      message.latestTime = object.latestTime;
    } else {
      message.latestTime = undefined;
    }
    return message;
  },
};

const baseStatusFilter: object = { status: 0 };

export const StatusFilter = {
  encode(
    message: StatusFilter,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseStatusFilter } as StatusFilter;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StatusFilter {
    const message = { ...baseStatusFilter } as StatusFilter;
    if (object.status !== undefined && object.status !== null) {
      message.status = workflowExecutionStatusFromJSON(object.status);
    } else {
      message.status = 0;
    }
    return message;
  },

  toJSON(message: StatusFilter): unknown {
    const obj: any = {};
    message.status !== undefined &&
      (obj.status = workflowExecutionStatusToJSON(message.status));
    return obj;
  },

  fromPartial(object: DeepPartial<StatusFilter>): StatusFilter {
    const message = { ...baseStatusFilter } as StatusFilter;
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    } else {
      message.status = 0;
    }
    return message;
  },
};

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

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
