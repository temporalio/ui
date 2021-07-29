/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  NamespaceState,
  ArchivalState,
  namespaceStateFromJSON,
  namespaceStateToJSON,
  archivalStateFromJSON,
  archivalStateToJSON,
} from '../../../../temporal/api/enums/v1/namespace';
import { Timestamp } from '../../../../google/protobuf/timestamp';
import { Duration } from '../../../../google/protobuf/duration';

export const protobufPackage = 'temporal.api.namespace.v1';

export interface NamespaceInfo {
  name: string;
  state: NamespaceState;
  description: string;
  ownerEmail: string;
  /** A key-value map for any customized purpose. */
  data: { [key: string]: string };
  id: string;
}

export interface NamespaceInfo_DataEntry {
  key: string;
  value: string;
}

export interface NamespaceConfig {
  workflowExecutionRetentionTtl: Duration | undefined;
  badBinaries: BadBinaries | undefined;
  /** If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used. */
  historyArchivalState: ArchivalState;
  historyArchivalUri: string;
  /** If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used. */
  visibilityArchivalState: ArchivalState;
  visibilityArchivalUri: string;
}

export interface BadBinaries {
  binaries: { [key: string]: BadBinaryInfo };
}

export interface BadBinaries_BinariesEntry {
  key: string;
  value: BadBinaryInfo | undefined;
}

export interface BadBinaryInfo {
  reason: string;
  operator: string;
  createTime: Date | undefined;
}

export interface UpdateNamespaceInfo {
  description: string;
  ownerEmail: string;
  /** A key-value map for any customized purpose. */
  data: { [key: string]: string };
}

export interface UpdateNamespaceInfo_DataEntry {
  key: string;
  value: string;
}

const baseNamespaceInfo: object = {
  name: '',
  state: 0,
  description: '',
  ownerEmail: '',
  id: '',
};

export const NamespaceInfo = {
  encode(
    message: NamespaceInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state);
    }
    if (message.description !== '') {
      writer.uint32(26).string(message.description);
    }
    if (message.ownerEmail !== '') {
      writer.uint32(34).string(message.ownerEmail);
    }
    Object.entries(message.data).forEach(([key, value]) => {
      NamespaceInfo_DataEntry.encode(
        { key: key as any, value },
        writer.uint32(42).fork(),
      ).ldelim();
    });
    if (message.id !== '') {
      writer.uint32(50).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NamespaceInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNamespaceInfo } as NamespaceInfo;
    message.data = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.state = reader.int32() as any;
          break;
        case 3:
          message.description = reader.string();
          break;
        case 4:
          message.ownerEmail = reader.string();
          break;
        case 5:
          const entry5 = NamespaceInfo_DataEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry5.value !== undefined) {
            message.data[entry5.key] = entry5.value;
          }
          break;
        case 6:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NamespaceInfo {
    const message = { ...baseNamespaceInfo } as NamespaceInfo;
    message.data = {};
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = '';
    }
    if (object.state !== undefined && object.state !== null) {
      message.state = namespaceStateFromJSON(object.state);
    } else {
      message.state = 0;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = String(object.description);
    } else {
      message.description = '';
    }
    if (object.ownerEmail !== undefined && object.ownerEmail !== null) {
      message.ownerEmail = String(object.ownerEmail);
    } else {
      message.ownerEmail = '';
    }
    if (object.data !== undefined && object.data !== null) {
      Object.entries(object.data).forEach(([key, value]) => {
        message.data[key] = String(value);
      });
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = String(object.id);
    } else {
      message.id = '';
    }
    return message;
  },

  toJSON(message: NamespaceInfo): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.state !== undefined &&
      (obj.state = namespaceStateToJSON(message.state));
    message.description !== undefined &&
      (obj.description = message.description);
    message.ownerEmail !== undefined && (obj.ownerEmail = message.ownerEmail);
    obj.data = {};
    if (message.data) {
      Object.entries(message.data).forEach(([k, v]) => {
        obj.data[k] = v;
      });
    }
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial(object: DeepPartial<NamespaceInfo>): NamespaceInfo {
    const message = { ...baseNamespaceInfo } as NamespaceInfo;
    message.data = {};
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = '';
    }
    if (object.state !== undefined && object.state !== null) {
      message.state = object.state;
    } else {
      message.state = 0;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    } else {
      message.description = '';
    }
    if (object.ownerEmail !== undefined && object.ownerEmail !== null) {
      message.ownerEmail = object.ownerEmail;
    } else {
      message.ownerEmail = '';
    }
    if (object.data !== undefined && object.data !== null) {
      Object.entries(object.data).forEach(([key, value]) => {
        if (value !== undefined) {
          message.data[key] = String(value);
        }
      });
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = '';
    }
    return message;
  },
};

const baseNamespaceInfo_DataEntry: object = { key: '', value: '' };

export const NamespaceInfo_DataEntry = {
  encode(
    message: NamespaceInfo_DataEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): NamespaceInfo_DataEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseNamespaceInfo_DataEntry,
    } as NamespaceInfo_DataEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NamespaceInfo_DataEntry {
    const message = {
      ...baseNamespaceInfo_DataEntry,
    } as NamespaceInfo_DataEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = String(object.value);
    } else {
      message.value = '';
    }
    return message;
  },

  toJSON(message: NamespaceInfo_DataEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial(
    object: DeepPartial<NamespaceInfo_DataEntry>,
  ): NamespaceInfo_DataEntry {
    const message = {
      ...baseNamespaceInfo_DataEntry,
    } as NamespaceInfo_DataEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    } else {
      message.value = '';
    }
    return message;
  },
};

const baseNamespaceConfig: object = {
  historyArchivalState: 0,
  historyArchivalUri: '',
  visibilityArchivalState: 0,
  visibilityArchivalUri: '',
};

export const NamespaceConfig = {
  encode(
    message: NamespaceConfig,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.workflowExecutionRetentionTtl !== undefined) {
      Duration.encode(
        message.workflowExecutionRetentionTtl,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.badBinaries !== undefined) {
      BadBinaries.encode(
        message.badBinaries,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.historyArchivalState !== 0) {
      writer.uint32(24).int32(message.historyArchivalState);
    }
    if (message.historyArchivalUri !== '') {
      writer.uint32(34).string(message.historyArchivalUri);
    }
    if (message.visibilityArchivalState !== 0) {
      writer.uint32(40).int32(message.visibilityArchivalState);
    }
    if (message.visibilityArchivalUri !== '') {
      writer.uint32(50).string(message.visibilityArchivalUri);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NamespaceConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNamespaceConfig } as NamespaceConfig;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.workflowExecutionRetentionTtl = Duration.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.badBinaries = BadBinaries.decode(reader, reader.uint32());
          break;
        case 3:
          message.historyArchivalState = reader.int32() as any;
          break;
        case 4:
          message.historyArchivalUri = reader.string();
          break;
        case 5:
          message.visibilityArchivalState = reader.int32() as any;
          break;
        case 6:
          message.visibilityArchivalUri = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NamespaceConfig {
    const message = { ...baseNamespaceConfig } as NamespaceConfig;
    if (
      object.workflowExecutionRetentionTtl !== undefined &&
      object.workflowExecutionRetentionTtl !== null
    ) {
      message.workflowExecutionRetentionTtl = Duration.fromJSON(
        object.workflowExecutionRetentionTtl,
      );
    } else {
      message.workflowExecutionRetentionTtl = undefined;
    }
    if (object.badBinaries !== undefined && object.badBinaries !== null) {
      message.badBinaries = BadBinaries.fromJSON(object.badBinaries);
    } else {
      message.badBinaries = undefined;
    }
    if (
      object.historyArchivalState !== undefined &&
      object.historyArchivalState !== null
    ) {
      message.historyArchivalState = archivalStateFromJSON(
        object.historyArchivalState,
      );
    } else {
      message.historyArchivalState = 0;
    }
    if (
      object.historyArchivalUri !== undefined &&
      object.historyArchivalUri !== null
    ) {
      message.historyArchivalUri = String(object.historyArchivalUri);
    } else {
      message.historyArchivalUri = '';
    }
    if (
      object.visibilityArchivalState !== undefined &&
      object.visibilityArchivalState !== null
    ) {
      message.visibilityArchivalState = archivalStateFromJSON(
        object.visibilityArchivalState,
      );
    } else {
      message.visibilityArchivalState = 0;
    }
    if (
      object.visibilityArchivalUri !== undefined &&
      object.visibilityArchivalUri !== null
    ) {
      message.visibilityArchivalUri = String(object.visibilityArchivalUri);
    } else {
      message.visibilityArchivalUri = '';
    }
    return message;
  },

  toJSON(message: NamespaceConfig): unknown {
    const obj: any = {};
    message.workflowExecutionRetentionTtl !== undefined &&
      (obj.workflowExecutionRetentionTtl = message.workflowExecutionRetentionTtl
        ? Duration.toJSON(message.workflowExecutionRetentionTtl)
        : undefined);
    message.badBinaries !== undefined &&
      (obj.badBinaries = message.badBinaries
        ? BadBinaries.toJSON(message.badBinaries)
        : undefined);
    message.historyArchivalState !== undefined &&
      (obj.historyArchivalState = archivalStateToJSON(
        message.historyArchivalState,
      ));
    message.historyArchivalUri !== undefined &&
      (obj.historyArchivalUri = message.historyArchivalUri);
    message.visibilityArchivalState !== undefined &&
      (obj.visibilityArchivalState = archivalStateToJSON(
        message.visibilityArchivalState,
      ));
    message.visibilityArchivalUri !== undefined &&
      (obj.visibilityArchivalUri = message.visibilityArchivalUri);
    return obj;
  },

  fromPartial(object: DeepPartial<NamespaceConfig>): NamespaceConfig {
    const message = { ...baseNamespaceConfig } as NamespaceConfig;
    if (
      object.workflowExecutionRetentionTtl !== undefined &&
      object.workflowExecutionRetentionTtl !== null
    ) {
      message.workflowExecutionRetentionTtl = Duration.fromPartial(
        object.workflowExecutionRetentionTtl,
      );
    } else {
      message.workflowExecutionRetentionTtl = undefined;
    }
    if (object.badBinaries !== undefined && object.badBinaries !== null) {
      message.badBinaries = BadBinaries.fromPartial(object.badBinaries);
    } else {
      message.badBinaries = undefined;
    }
    if (
      object.historyArchivalState !== undefined &&
      object.historyArchivalState !== null
    ) {
      message.historyArchivalState = object.historyArchivalState;
    } else {
      message.historyArchivalState = 0;
    }
    if (
      object.historyArchivalUri !== undefined &&
      object.historyArchivalUri !== null
    ) {
      message.historyArchivalUri = object.historyArchivalUri;
    } else {
      message.historyArchivalUri = '';
    }
    if (
      object.visibilityArchivalState !== undefined &&
      object.visibilityArchivalState !== null
    ) {
      message.visibilityArchivalState = object.visibilityArchivalState;
    } else {
      message.visibilityArchivalState = 0;
    }
    if (
      object.visibilityArchivalUri !== undefined &&
      object.visibilityArchivalUri !== null
    ) {
      message.visibilityArchivalUri = object.visibilityArchivalUri;
    } else {
      message.visibilityArchivalUri = '';
    }
    return message;
  },
};

const baseBadBinaries: object = {};

export const BadBinaries = {
  encode(
    message: BadBinaries,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    Object.entries(message.binaries).forEach(([key, value]) => {
      BadBinaries_BinariesEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork(),
      ).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BadBinaries {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBadBinaries } as BadBinaries;
    message.binaries = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = BadBinaries_BinariesEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry1.value !== undefined) {
            message.binaries[entry1.key] = entry1.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BadBinaries {
    const message = { ...baseBadBinaries } as BadBinaries;
    message.binaries = {};
    if (object.binaries !== undefined && object.binaries !== null) {
      Object.entries(object.binaries).forEach(([key, value]) => {
        message.binaries[key] = BadBinaryInfo.fromJSON(value);
      });
    }
    return message;
  },

  toJSON(message: BadBinaries): unknown {
    const obj: any = {};
    obj.binaries = {};
    if (message.binaries) {
      Object.entries(message.binaries).forEach(([k, v]) => {
        obj.binaries[k] = BadBinaryInfo.toJSON(v);
      });
    }
    return obj;
  },

  fromPartial(object: DeepPartial<BadBinaries>): BadBinaries {
    const message = { ...baseBadBinaries } as BadBinaries;
    message.binaries = {};
    if (object.binaries !== undefined && object.binaries !== null) {
      Object.entries(object.binaries).forEach(([key, value]) => {
        if (value !== undefined) {
          message.binaries[key] = BadBinaryInfo.fromPartial(value);
        }
      });
    }
    return message;
  },
};

const baseBadBinaries_BinariesEntry: object = { key: '' };

export const BadBinaries_BinariesEntry = {
  encode(
    message: BadBinaries_BinariesEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      BadBinaryInfo.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): BadBinaries_BinariesEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseBadBinaries_BinariesEntry,
    } as BadBinaries_BinariesEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = BadBinaryInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): BadBinaries_BinariesEntry {
    const message = {
      ...baseBadBinaries_BinariesEntry,
    } as BadBinaries_BinariesEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = BadBinaryInfo.fromJSON(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },

  toJSON(message: BadBinaries_BinariesEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value
        ? BadBinaryInfo.toJSON(message.value)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<BadBinaries_BinariesEntry>,
  ): BadBinaries_BinariesEntry {
    const message = {
      ...baseBadBinaries_BinariesEntry,
    } as BadBinaries_BinariesEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = BadBinaryInfo.fromPartial(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },
};

const baseBadBinaryInfo: object = { reason: '', operator: '' };

export const BadBinaryInfo = {
  encode(
    message: BadBinaryInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.reason !== '') {
      writer.uint32(10).string(message.reason);
    }
    if (message.operator !== '') {
      writer.uint32(18).string(message.operator);
    }
    if (message.createTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.createTime),
        writer.uint32(26).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BadBinaryInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBadBinaryInfo } as BadBinaryInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.reason = reader.string();
          break;
        case 2:
          message.operator = reader.string();
          break;
        case 3:
          message.createTime = fromTimestamp(
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

  fromJSON(object: any): BadBinaryInfo {
    const message = { ...baseBadBinaryInfo } as BadBinaryInfo;
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = String(object.reason);
    } else {
      message.reason = '';
    }
    if (object.operator !== undefined && object.operator !== null) {
      message.operator = String(object.operator);
    } else {
      message.operator = '';
    }
    if (object.createTime !== undefined && object.createTime !== null) {
      message.createTime = fromJsonTimestamp(object.createTime);
    } else {
      message.createTime = undefined;
    }
    return message;
  },

  toJSON(message: BadBinaryInfo): unknown {
    const obj: any = {};
    message.reason !== undefined && (obj.reason = message.reason);
    message.operator !== undefined && (obj.operator = message.operator);
    message.createTime !== undefined &&
      (obj.createTime = message.createTime.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<BadBinaryInfo>): BadBinaryInfo {
    const message = { ...baseBadBinaryInfo } as BadBinaryInfo;
    if (object.reason !== undefined && object.reason !== null) {
      message.reason = object.reason;
    } else {
      message.reason = '';
    }
    if (object.operator !== undefined && object.operator !== null) {
      message.operator = object.operator;
    } else {
      message.operator = '';
    }
    if (object.createTime !== undefined && object.createTime !== null) {
      message.createTime = object.createTime;
    } else {
      message.createTime = undefined;
    }
    return message;
  },
};

const baseUpdateNamespaceInfo: object = { description: '', ownerEmail: '' };

export const UpdateNamespaceInfo = {
  encode(
    message: UpdateNamespaceInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.description !== '') {
      writer.uint32(10).string(message.description);
    }
    if (message.ownerEmail !== '') {
      writer.uint32(18).string(message.ownerEmail);
    }
    Object.entries(message.data).forEach(([key, value]) => {
      UpdateNamespaceInfo_DataEntry.encode(
        { key: key as any, value },
        writer.uint32(26).fork(),
      ).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateNamespaceInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseUpdateNamespaceInfo } as UpdateNamespaceInfo;
    message.data = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.description = reader.string();
          break;
        case 2:
          message.ownerEmail = reader.string();
          break;
        case 3:
          const entry3 = UpdateNamespaceInfo_DataEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry3.value !== undefined) {
            message.data[entry3.key] = entry3.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateNamespaceInfo {
    const message = { ...baseUpdateNamespaceInfo } as UpdateNamespaceInfo;
    message.data = {};
    if (object.description !== undefined && object.description !== null) {
      message.description = String(object.description);
    } else {
      message.description = '';
    }
    if (object.ownerEmail !== undefined && object.ownerEmail !== null) {
      message.ownerEmail = String(object.ownerEmail);
    } else {
      message.ownerEmail = '';
    }
    if (object.data !== undefined && object.data !== null) {
      Object.entries(object.data).forEach(([key, value]) => {
        message.data[key] = String(value);
      });
    }
    return message;
  },

  toJSON(message: UpdateNamespaceInfo): unknown {
    const obj: any = {};
    message.description !== undefined &&
      (obj.description = message.description);
    message.ownerEmail !== undefined && (obj.ownerEmail = message.ownerEmail);
    obj.data = {};
    if (message.data) {
      Object.entries(message.data).forEach(([k, v]) => {
        obj.data[k] = v;
      });
    }
    return obj;
  },

  fromPartial(object: DeepPartial<UpdateNamespaceInfo>): UpdateNamespaceInfo {
    const message = { ...baseUpdateNamespaceInfo } as UpdateNamespaceInfo;
    message.data = {};
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    } else {
      message.description = '';
    }
    if (object.ownerEmail !== undefined && object.ownerEmail !== null) {
      message.ownerEmail = object.ownerEmail;
    } else {
      message.ownerEmail = '';
    }
    if (object.data !== undefined && object.data !== null) {
      Object.entries(object.data).forEach(([key, value]) => {
        if (value !== undefined) {
          message.data[key] = String(value);
        }
      });
    }
    return message;
  },
};

const baseUpdateNamespaceInfo_DataEntry: object = { key: '', value: '' };

export const UpdateNamespaceInfo_DataEntry = {
  encode(
    message: UpdateNamespaceInfo_DataEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): UpdateNamespaceInfo_DataEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseUpdateNamespaceInfo_DataEntry,
    } as UpdateNamespaceInfo_DataEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateNamespaceInfo_DataEntry {
    const message = {
      ...baseUpdateNamespaceInfo_DataEntry,
    } as UpdateNamespaceInfo_DataEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = String(object.value);
    } else {
      message.value = '';
    }
    return message;
  },

  toJSON(message: UpdateNamespaceInfo_DataEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial(
    object: DeepPartial<UpdateNamespaceInfo_DataEntry>,
  ): UpdateNamespaceInfo_DataEntry {
    const message = {
      ...baseUpdateNamespaceInfo_DataEntry,
    } as UpdateNamespaceInfo_DataEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    } else {
      message.value = '';
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
