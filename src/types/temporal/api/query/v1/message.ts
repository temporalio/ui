/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  QueryResultType,
  queryResultTypeFromJSON,
  queryResultTypeToJSON,
} from '../../../../temporal/api/enums/v1/query';
import {
  WorkflowExecutionStatus,
  workflowExecutionStatusFromJSON,
  workflowExecutionStatusToJSON,
} from '../../../../temporal/api/enums/v1/workflow';
import { Payloads } from '../../../../temporal/api/common/v1/message';

export const protobufPackage = 'temporal.api.query.v1';

export interface WorkflowQuery {
  queryType: string;
  queryArgs: Payloads | undefined;
}

export interface WorkflowQueryResult {
  resultType: QueryResultType;
  answer: Payloads | undefined;
  errorMessage: string;
}

export interface QueryRejected {
  status: WorkflowExecutionStatus;
}

const baseWorkflowQuery: object = { queryType: '' };

export const WorkflowQuery = {
  encode(
    message: WorkflowQuery,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryType !== '') {
      writer.uint32(10).string(message.queryType);
    }
    if (message.queryArgs !== undefined) {
      Payloads.encode(message.queryArgs, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowQuery {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWorkflowQuery } as WorkflowQuery;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.queryType = reader.string();
          break;
        case 2:
          message.queryArgs = Payloads.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowQuery {
    const message = { ...baseWorkflowQuery } as WorkflowQuery;
    if (object.queryType !== undefined && object.queryType !== null) {
      message.queryType = String(object.queryType);
    } else {
      message.queryType = '';
    }
    if (object.queryArgs !== undefined && object.queryArgs !== null) {
      message.queryArgs = Payloads.fromJSON(object.queryArgs);
    } else {
      message.queryArgs = undefined;
    }
    return message;
  },

  toJSON(message: WorkflowQuery): unknown {
    const obj: any = {};
    message.queryType !== undefined && (obj.queryType = message.queryType);
    message.queryArgs !== undefined &&
      (obj.queryArgs = message.queryArgs
        ? Payloads.toJSON(message.queryArgs)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<WorkflowQuery>): WorkflowQuery {
    const message = { ...baseWorkflowQuery } as WorkflowQuery;
    if (object.queryType !== undefined && object.queryType !== null) {
      message.queryType = object.queryType;
    } else {
      message.queryType = '';
    }
    if (object.queryArgs !== undefined && object.queryArgs !== null) {
      message.queryArgs = Payloads.fromPartial(object.queryArgs);
    } else {
      message.queryArgs = undefined;
    }
    return message;
  },
};

const baseWorkflowQueryResult: object = { resultType: 0, errorMessage: '' };

export const WorkflowQueryResult = {
  encode(
    message: WorkflowQueryResult,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.resultType !== 0) {
      writer.uint32(8).int32(message.resultType);
    }
    if (message.answer !== undefined) {
      Payloads.encode(message.answer, writer.uint32(18).fork()).ldelim();
    }
    if (message.errorMessage !== '') {
      writer.uint32(26).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowQueryResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWorkflowQueryResult } as WorkflowQueryResult;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.resultType = reader.int32() as any;
          break;
        case 2:
          message.answer = Payloads.decode(reader, reader.uint32());
          break;
        case 3:
          message.errorMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WorkflowQueryResult {
    const message = { ...baseWorkflowQueryResult } as WorkflowQueryResult;
    if (object.resultType !== undefined && object.resultType !== null) {
      message.resultType = queryResultTypeFromJSON(object.resultType);
    } else {
      message.resultType = 0;
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = Payloads.fromJSON(object.answer);
    } else {
      message.answer = undefined;
    }
    if (object.errorMessage !== undefined && object.errorMessage !== null) {
      message.errorMessage = String(object.errorMessage);
    } else {
      message.errorMessage = '';
    }
    return message;
  },

  toJSON(message: WorkflowQueryResult): unknown {
    const obj: any = {};
    message.resultType !== undefined &&
      (obj.resultType = queryResultTypeToJSON(message.resultType));
    message.answer !== undefined &&
      (obj.answer = message.answer
        ? Payloads.toJSON(message.answer)
        : undefined);
    message.errorMessage !== undefined &&
      (obj.errorMessage = message.errorMessage);
    return obj;
  },

  fromPartial(object: DeepPartial<WorkflowQueryResult>): WorkflowQueryResult {
    const message = { ...baseWorkflowQueryResult } as WorkflowQueryResult;
    if (object.resultType !== undefined && object.resultType !== null) {
      message.resultType = object.resultType;
    } else {
      message.resultType = 0;
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = Payloads.fromPartial(object.answer);
    } else {
      message.answer = undefined;
    }
    if (object.errorMessage !== undefined && object.errorMessage !== null) {
      message.errorMessage = object.errorMessage;
    } else {
      message.errorMessage = '';
    }
    return message;
  },
};

const baseQueryRejected: object = { status: 0 };

export const QueryRejected = {
  encode(
    message: QueryRejected,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryRejected {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryRejected } as QueryRejected;
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

  fromJSON(object: any): QueryRejected {
    const message = { ...baseQueryRejected } as QueryRejected;
    if (object.status !== undefined && object.status !== null) {
      message.status = workflowExecutionStatusFromJSON(object.status);
    } else {
      message.status = 0;
    }
    return message;
  },

  toJSON(message: QueryRejected): unknown {
    const obj: any = {};
    message.status !== undefined &&
      (obj.status = workflowExecutionStatusToJSON(message.status));
    return obj;
  },

  fromPartial(object: DeepPartial<QueryRejected>): QueryRejected {
    const message = { ...baseQueryRejected } as QueryRejected;
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

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
