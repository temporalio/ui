/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.errordetails.v1';

export interface NotFoundFailure {
  currentCluster: string;
  activeCluster: string;
}

export interface WorkflowExecutionAlreadyStartedFailure {
  startRequestId: string;
  runId: string;
}

export interface NamespaceNotActiveFailure {
  namespace: string;
  currentCluster: string;
  activeCluster: string;
}

export interface ClientVersionNotSupportedFailure {
  clientVersion: string;
  clientName: string;
  supportedVersions: string;
}

export interface ServerVersionNotSupportedFailure {
  serverVersion: string;
  clientSupportedServerVersions: string;
}

export interface NamespaceAlreadyExistsFailure {}

export interface CancellationAlreadyRequestedFailure {}

export interface QueryFailedFailure {}

export interface PermissionDeniedFailure {
  reason: string;
}

const baseNotFoundFailure: object = { currentCluster: '', activeCluster: '' };

export const NotFoundFailure = {
  encode(
    message: NotFoundFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.currentCluster !== '') {
      writer.uint32(10).string(message.currentCluster);
    }
    if (message.activeCluster !== '') {
      writer.uint32(18).string(message.activeCluster);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NotFoundFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNotFoundFailure } as NotFoundFailure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.currentCluster = reader.string();
          break;
        case 2:
          message.activeCluster = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NotFoundFailure {
    const message = { ...baseNotFoundFailure } as NotFoundFailure;
    if (object.currentCluster !== undefined && object.currentCluster !== null) {
      message.currentCluster = String(object.currentCluster);
    } else {
      message.currentCluster = '';
    }
    if (object.activeCluster !== undefined && object.activeCluster !== null) {
      message.activeCluster = String(object.activeCluster);
    } else {
      message.activeCluster = '';
    }
    return message;
  },

  toJSON(message: NotFoundFailure): unknown {
    const obj: any = {};
    message.currentCluster !== undefined &&
      (obj.currentCluster = message.currentCluster);
    message.activeCluster !== undefined &&
      (obj.activeCluster = message.activeCluster);
    return obj;
  },

  fromPartial(object: DeepPartial<NotFoundFailure>): NotFoundFailure {
    const message = { ...baseNotFoundFailure } as NotFoundFailure;
    if (object.currentCluster !== undefined && object.currentCluster !== null) {
      message.currentCluster = object.currentCluster;
    } else {
      message.currentCluster = '';
    }
    if (object.activeCluster !== undefined && object.activeCluster !== null) {
      message.activeCluster = object.activeCluster;
    } else {
      message.activeCluster = '';
    }
    return message;
  },
};

const baseWorkflowExecutionAlreadyStartedFailure: object = {
  startRequestId: '',
  runId: '',
};

export const WorkflowExecutionAlreadyStartedFailure = {
  encode(
    message: WorkflowExecutionAlreadyStartedFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.startRequestId !== '') {
      writer.uint32(10).string(message.startRequestId);
    }
    if (message.runId !== '') {
      writer.uint32(18).string(message.runId);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): WorkflowExecutionAlreadyStartedFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWorkflowExecutionAlreadyStartedFailure,
    } as WorkflowExecutionAlreadyStartedFailure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.startRequestId = reader.string();
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

  fromJSON(object: any): WorkflowExecutionAlreadyStartedFailure {
    const message = {
      ...baseWorkflowExecutionAlreadyStartedFailure,
    } as WorkflowExecutionAlreadyStartedFailure;
    if (object.startRequestId !== undefined && object.startRequestId !== null) {
      message.startRequestId = String(object.startRequestId);
    } else {
      message.startRequestId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = String(object.runId);
    } else {
      message.runId = '';
    }
    return message;
  },

  toJSON(message: WorkflowExecutionAlreadyStartedFailure): unknown {
    const obj: any = {};
    message.startRequestId !== undefined &&
      (obj.startRequestId = message.startRequestId);
    message.runId !== undefined && (obj.runId = message.runId);
    return obj;
  },

  fromPartial(
    object: DeepPartial<WorkflowExecutionAlreadyStartedFailure>,
  ): WorkflowExecutionAlreadyStartedFailure {
    const message = {
      ...baseWorkflowExecutionAlreadyStartedFailure,
    } as WorkflowExecutionAlreadyStartedFailure;
    if (object.startRequestId !== undefined && object.startRequestId !== null) {
      message.startRequestId = object.startRequestId;
    } else {
      message.startRequestId = '';
    }
    if (object.runId !== undefined && object.runId !== null) {
      message.runId = object.runId;
    } else {
      message.runId = '';
    }
    return message;
  },
};

const baseNamespaceNotActiveFailure: object = {
  namespace: '',
  currentCluster: '',
  activeCluster: '',
};

export const NamespaceNotActiveFailure = {
  encode(
    message: NamespaceNotActiveFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.namespace !== '') {
      writer.uint32(10).string(message.namespace);
    }
    if (message.currentCluster !== '') {
      writer.uint32(18).string(message.currentCluster);
    }
    if (message.activeCluster !== '') {
      writer.uint32(26).string(message.activeCluster);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): NamespaceNotActiveFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseNamespaceNotActiveFailure,
    } as NamespaceNotActiveFailure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.namespace = reader.string();
          break;
        case 2:
          message.currentCluster = reader.string();
          break;
        case 3:
          message.activeCluster = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NamespaceNotActiveFailure {
    const message = {
      ...baseNamespaceNotActiveFailure,
    } as NamespaceNotActiveFailure;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = String(object.namespace);
    } else {
      message.namespace = '';
    }
    if (object.currentCluster !== undefined && object.currentCluster !== null) {
      message.currentCluster = String(object.currentCluster);
    } else {
      message.currentCluster = '';
    }
    if (object.activeCluster !== undefined && object.activeCluster !== null) {
      message.activeCluster = String(object.activeCluster);
    } else {
      message.activeCluster = '';
    }
    return message;
  },

  toJSON(message: NamespaceNotActiveFailure): unknown {
    const obj: any = {};
    message.namespace !== undefined && (obj.namespace = message.namespace);
    message.currentCluster !== undefined &&
      (obj.currentCluster = message.currentCluster);
    message.activeCluster !== undefined &&
      (obj.activeCluster = message.activeCluster);
    return obj;
  },

  fromPartial(
    object: DeepPartial<NamespaceNotActiveFailure>,
  ): NamespaceNotActiveFailure {
    const message = {
      ...baseNamespaceNotActiveFailure,
    } as NamespaceNotActiveFailure;
    if (object.namespace !== undefined && object.namespace !== null) {
      message.namespace = object.namespace;
    } else {
      message.namespace = '';
    }
    if (object.currentCluster !== undefined && object.currentCluster !== null) {
      message.currentCluster = object.currentCluster;
    } else {
      message.currentCluster = '';
    }
    if (object.activeCluster !== undefined && object.activeCluster !== null) {
      message.activeCluster = object.activeCluster;
    } else {
      message.activeCluster = '';
    }
    return message;
  },
};

const baseClientVersionNotSupportedFailure: object = {
  clientVersion: '',
  clientName: '',
  supportedVersions: '',
};

export const ClientVersionNotSupportedFailure = {
  encode(
    message: ClientVersionNotSupportedFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.clientVersion !== '') {
      writer.uint32(10).string(message.clientVersion);
    }
    if (message.clientName !== '') {
      writer.uint32(18).string(message.clientName);
    }
    if (message.supportedVersions !== '') {
      writer.uint32(26).string(message.supportedVersions);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ClientVersionNotSupportedFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseClientVersionNotSupportedFailure,
    } as ClientVersionNotSupportedFailure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientVersion = reader.string();
          break;
        case 2:
          message.clientName = reader.string();
          break;
        case 3:
          message.supportedVersions = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ClientVersionNotSupportedFailure {
    const message = {
      ...baseClientVersionNotSupportedFailure,
    } as ClientVersionNotSupportedFailure;
    if (object.clientVersion !== undefined && object.clientVersion !== null) {
      message.clientVersion = String(object.clientVersion);
    } else {
      message.clientVersion = '';
    }
    if (object.clientName !== undefined && object.clientName !== null) {
      message.clientName = String(object.clientName);
    } else {
      message.clientName = '';
    }
    if (
      object.supportedVersions !== undefined &&
      object.supportedVersions !== null
    ) {
      message.supportedVersions = String(object.supportedVersions);
    } else {
      message.supportedVersions = '';
    }
    return message;
  },

  toJSON(message: ClientVersionNotSupportedFailure): unknown {
    const obj: any = {};
    message.clientVersion !== undefined &&
      (obj.clientVersion = message.clientVersion);
    message.clientName !== undefined && (obj.clientName = message.clientName);
    message.supportedVersions !== undefined &&
      (obj.supportedVersions = message.supportedVersions);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ClientVersionNotSupportedFailure>,
  ): ClientVersionNotSupportedFailure {
    const message = {
      ...baseClientVersionNotSupportedFailure,
    } as ClientVersionNotSupportedFailure;
    if (object.clientVersion !== undefined && object.clientVersion !== null) {
      message.clientVersion = object.clientVersion;
    } else {
      message.clientVersion = '';
    }
    if (object.clientName !== undefined && object.clientName !== null) {
      message.clientName = object.clientName;
    } else {
      message.clientName = '';
    }
    if (
      object.supportedVersions !== undefined &&
      object.supportedVersions !== null
    ) {
      message.supportedVersions = object.supportedVersions;
    } else {
      message.supportedVersions = '';
    }
    return message;
  },
};

const baseServerVersionNotSupportedFailure: object = {
  serverVersion: '',
  clientSupportedServerVersions: '',
};

export const ServerVersionNotSupportedFailure = {
  encode(
    message: ServerVersionNotSupportedFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.serverVersion !== '') {
      writer.uint32(10).string(message.serverVersion);
    }
    if (message.clientSupportedServerVersions !== '') {
      writer.uint32(18).string(message.clientSupportedServerVersions);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): ServerVersionNotSupportedFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseServerVersionNotSupportedFailure,
    } as ServerVersionNotSupportedFailure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serverVersion = reader.string();
          break;
        case 2:
          message.clientSupportedServerVersions = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ServerVersionNotSupportedFailure {
    const message = {
      ...baseServerVersionNotSupportedFailure,
    } as ServerVersionNotSupportedFailure;
    if (object.serverVersion !== undefined && object.serverVersion !== null) {
      message.serverVersion = String(object.serverVersion);
    } else {
      message.serverVersion = '';
    }
    if (
      object.clientSupportedServerVersions !== undefined &&
      object.clientSupportedServerVersions !== null
    ) {
      message.clientSupportedServerVersions = String(
        object.clientSupportedServerVersions,
      );
    } else {
      message.clientSupportedServerVersions = '';
    }
    return message;
  },

  toJSON(message: ServerVersionNotSupportedFailure): unknown {
    const obj: any = {};
    message.serverVersion !== undefined &&
      (obj.serverVersion = message.serverVersion);
    message.clientSupportedServerVersions !== undefined &&
      (obj.clientSupportedServerVersions =
        message.clientSupportedServerVersions);
    return obj;
  },

  fromPartial(
    object: DeepPartial<ServerVersionNotSupportedFailure>,
  ): ServerVersionNotSupportedFailure {
    const message = {
      ...baseServerVersionNotSupportedFailure,
    } as ServerVersionNotSupportedFailure;
    if (object.serverVersion !== undefined && object.serverVersion !== null) {
      message.serverVersion = object.serverVersion;
    } else {
      message.serverVersion = '';
    }
    if (
      object.clientSupportedServerVersions !== undefined &&
      object.clientSupportedServerVersions !== null
    ) {
      message.clientSupportedServerVersions =
        object.clientSupportedServerVersions;
    } else {
      message.clientSupportedServerVersions = '';
    }
    return message;
  },
};

const baseNamespaceAlreadyExistsFailure: object = {};

export const NamespaceAlreadyExistsFailure = {
  encode(
    _: NamespaceAlreadyExistsFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): NamespaceAlreadyExistsFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseNamespaceAlreadyExistsFailure,
    } as NamespaceAlreadyExistsFailure;
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

  fromJSON(_: any): NamespaceAlreadyExistsFailure {
    const message = {
      ...baseNamespaceAlreadyExistsFailure,
    } as NamespaceAlreadyExistsFailure;
    return message;
  },

  toJSON(_: NamespaceAlreadyExistsFailure): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<NamespaceAlreadyExistsFailure>,
  ): NamespaceAlreadyExistsFailure {
    const message = {
      ...baseNamespaceAlreadyExistsFailure,
    } as NamespaceAlreadyExistsFailure;
    return message;
  },
};

const baseCancellationAlreadyRequestedFailure: object = {};

export const CancellationAlreadyRequestedFailure = {
  encode(
    _: CancellationAlreadyRequestedFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): CancellationAlreadyRequestedFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseCancellationAlreadyRequestedFailure,
    } as CancellationAlreadyRequestedFailure;
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

  fromJSON(_: any): CancellationAlreadyRequestedFailure {
    const message = {
      ...baseCancellationAlreadyRequestedFailure,
    } as CancellationAlreadyRequestedFailure;
    return message;
  },

  toJSON(_: CancellationAlreadyRequestedFailure): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<CancellationAlreadyRequestedFailure>,
  ): CancellationAlreadyRequestedFailure {
    const message = {
      ...baseCancellationAlreadyRequestedFailure,
    } as CancellationAlreadyRequestedFailure;
    return message;
  },
};

const baseQueryFailedFailure: object = {};

export const QueryFailedFailure = {
  encode(
    _: QueryFailedFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryFailedFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryFailedFailure } as QueryFailedFailure;
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

  fromJSON(_: any): QueryFailedFailure {
    const message = { ...baseQueryFailedFailure } as QueryFailedFailure;
    return message;
  },

  toJSON(_: QueryFailedFailure): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<QueryFailedFailure>): QueryFailedFailure {
    const message = { ...baseQueryFailedFailure } as QueryFailedFailure;
    return message;
  },
};

const basePermissionDeniedFailure: object = { reason: '' };

export const PermissionDeniedFailure = {
  encode(
    message: PermissionDeniedFailure,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.reason !== '') {
      writer.uint32(10).string(message.reason);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): PermissionDeniedFailure {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...basePermissionDeniedFailure,
    } as PermissionDeniedFailure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.reason = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PermissionDeniedFailure {
    const message = {
      ...basePermissionDeniedFailure,
    } as PermissionDeniedFailure;
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = String(object.reason);
    } else {
      message.reason = '';
    }
    return message;
  },

  toJSON(message: PermissionDeniedFailure): unknown {
    const obj: any = {};
    message.reason !== undefined && (obj.reason = message.reason);
    return obj;
  },

  fromPartial(
    object: DeepPartial<PermissionDeniedFailure>,
  ): PermissionDeniedFailure {
    const message = {
      ...basePermissionDeniedFailure,
    } as PermissionDeniedFailure;
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = object.reason;
    } else {
      message.reason = '';
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
