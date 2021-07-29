/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  Severity,
  severityFromJSON,
  severityToJSON,
} from '../../../../temporal/api/enums/v1/common';
import { Timestamp } from '../../../../google/protobuf/timestamp';

export const protobufPackage = 'temporal.api.version.v1';

/** ReleaseInfo contains information about specific version of temporal. */
export interface ReleaseInfo {
  version: string;
  releaseTime: Date | undefined;
  notes: string;
}

/** Alert contains notification and severity. */
export interface Alert {
  message: string;
  severity: Severity;
}

/** VersionInfo contains details about current and recommended release versions as well as alerts and upgrade instructions. */
export interface VersionInfo {
  current: ReleaseInfo | undefined;
  recommended: ReleaseInfo | undefined;
  instructions: string;
  alerts: Alert[];
  lastUpdateTime: Date | undefined;
}

const baseReleaseInfo: object = { version: '', notes: '' };

export const ReleaseInfo = {
  encode(
    message: ReleaseInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.version !== '') {
      writer.uint32(10).string(message.version);
    }
    if (message.releaseTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.releaseTime),
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.notes !== '') {
      writer.uint32(26).string(message.notes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReleaseInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseReleaseInfo } as ReleaseInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.version = reader.string();
          break;
        case 2:
          message.releaseTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32()),
          );
          break;
        case 3:
          message.notes = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ReleaseInfo {
    const message = { ...baseReleaseInfo } as ReleaseInfo;
    if (object.version !== undefined && object.version !== null) {
      message.version = String(object.version);
    } else {
      message.version = '';
    }
    if (object.releaseTime !== undefined && object.releaseTime !== null) {
      message.releaseTime = fromJsonTimestamp(object.releaseTime);
    } else {
      message.releaseTime = undefined;
    }
    if (object.notes !== undefined && object.notes !== null) {
      message.notes = String(object.notes);
    } else {
      message.notes = '';
    }
    return message;
  },

  toJSON(message: ReleaseInfo): unknown {
    const obj: any = {};
    message.version !== undefined && (obj.version = message.version);
    message.releaseTime !== undefined &&
      (obj.releaseTime = message.releaseTime.toISOString());
    message.notes !== undefined && (obj.notes = message.notes);
    return obj;
  },

  fromPartial(object: DeepPartial<ReleaseInfo>): ReleaseInfo {
    const message = { ...baseReleaseInfo } as ReleaseInfo;
    if (object.version !== undefined && object.version !== null) {
      message.version = object.version;
    } else {
      message.version = '';
    }
    if (object.releaseTime !== undefined && object.releaseTime !== null) {
      message.releaseTime = object.releaseTime;
    } else {
      message.releaseTime = undefined;
    }
    if (object.notes !== undefined && object.notes !== null) {
      message.notes = object.notes;
    } else {
      message.notes = '';
    }
    return message;
  },
};

const baseAlert: object = { message: '', severity: 0 };

export const Alert = {
  encode(message: Alert, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== '') {
      writer.uint32(10).string(message.message);
    }
    if (message.severity !== 0) {
      writer.uint32(16).int32(message.severity);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Alert {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseAlert } as Alert;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.severity = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Alert {
    const message = { ...baseAlert } as Alert;
    if (object.message !== undefined && object.message !== null) {
      message.message = String(object.message);
    } else {
      message.message = '';
    }
    if (object.severity !== undefined && object.severity !== null) {
      message.severity = severityFromJSON(object.severity);
    } else {
      message.severity = 0;
    }
    return message;
  },

  toJSON(message: Alert): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.severity !== undefined &&
      (obj.severity = severityToJSON(message.severity));
    return obj;
  },

  fromPartial(object: DeepPartial<Alert>): Alert {
    const message = { ...baseAlert } as Alert;
    if (object.message !== undefined && object.message !== null) {
      message.message = object.message;
    } else {
      message.message = '';
    }
    if (object.severity !== undefined && object.severity !== null) {
      message.severity = object.severity;
    } else {
      message.severity = 0;
    }
    return message;
  },
};

const baseVersionInfo: object = { instructions: '' };

export const VersionInfo = {
  encode(
    message: VersionInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.current !== undefined) {
      ReleaseInfo.encode(message.current, writer.uint32(10).fork()).ldelim();
    }
    if (message.recommended !== undefined) {
      ReleaseInfo.encode(
        message.recommended,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    if (message.instructions !== '') {
      writer.uint32(26).string(message.instructions);
    }
    for (const v of message.alerts) {
      Alert.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.lastUpdateTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastUpdateTime),
        writer.uint32(42).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseVersionInfo } as VersionInfo;
    message.alerts = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.current = ReleaseInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.recommended = ReleaseInfo.decode(reader, reader.uint32());
          break;
        case 3:
          message.instructions = reader.string();
          break;
        case 4:
          message.alerts.push(Alert.decode(reader, reader.uint32()));
          break;
        case 5:
          message.lastUpdateTime = fromTimestamp(
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

  fromJSON(object: any): VersionInfo {
    const message = { ...baseVersionInfo } as VersionInfo;
    message.alerts = [];
    if (object.current !== undefined && object.current !== null) {
      message.current = ReleaseInfo.fromJSON(object.current);
    } else {
      message.current = undefined;
    }
    if (object.recommended !== undefined && object.recommended !== null) {
      message.recommended = ReleaseInfo.fromJSON(object.recommended);
    } else {
      message.recommended = undefined;
    }
    if (object.instructions !== undefined && object.instructions !== null) {
      message.instructions = String(object.instructions);
    } else {
      message.instructions = '';
    }
    if (object.alerts !== undefined && object.alerts !== null) {
      for (const e of object.alerts) {
        message.alerts.push(Alert.fromJSON(e));
      }
    }
    if (object.lastUpdateTime !== undefined && object.lastUpdateTime !== null) {
      message.lastUpdateTime = fromJsonTimestamp(object.lastUpdateTime);
    } else {
      message.lastUpdateTime = undefined;
    }
    return message;
  },

  toJSON(message: VersionInfo): unknown {
    const obj: any = {};
    message.current !== undefined &&
      (obj.current = message.current
        ? ReleaseInfo.toJSON(message.current)
        : undefined);
    message.recommended !== undefined &&
      (obj.recommended = message.recommended
        ? ReleaseInfo.toJSON(message.recommended)
        : undefined);
    message.instructions !== undefined &&
      (obj.instructions = message.instructions);
    if (message.alerts) {
      obj.alerts = message.alerts.map((e) => (e ? Alert.toJSON(e) : undefined));
    } else {
      obj.alerts = [];
    }
    message.lastUpdateTime !== undefined &&
      (obj.lastUpdateTime = message.lastUpdateTime.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<VersionInfo>): VersionInfo {
    const message = { ...baseVersionInfo } as VersionInfo;
    message.alerts = [];
    if (object.current !== undefined && object.current !== null) {
      message.current = ReleaseInfo.fromPartial(object.current);
    } else {
      message.current = undefined;
    }
    if (object.recommended !== undefined && object.recommended !== null) {
      message.recommended = ReleaseInfo.fromPartial(object.recommended);
    } else {
      message.recommended = undefined;
    }
    if (object.instructions !== undefined && object.instructions !== null) {
      message.instructions = object.instructions;
    } else {
      message.instructions = '';
    }
    if (object.alerts !== undefined && object.alerts !== null) {
      for (const e of object.alerts) {
        message.alerts.push(Alert.fromPartial(e));
      }
    }
    if (object.lastUpdateTime !== undefined && object.lastUpdateTime !== null) {
      message.lastUpdateTime = object.lastUpdateTime;
    } else {
      message.lastUpdateTime = undefined;
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
