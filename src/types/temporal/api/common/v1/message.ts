/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import {
  EncodingType,
  encodingTypeFromJSON,
  encodingTypeToJSON,
} from '../../../../temporal/api/enums/v1/common';
import { Duration } from '../../../../google/protobuf/duration';

export const protobufPackage = 'temporal.api.common.v1';

export interface DataBlob {
  encodingType: EncodingType;
  data: Uint8Array;
}

export interface Payloads {
  payloads: Payload[];
}

export interface Payload {
  metadata: { [key: string]: Uint8Array };
  data: Uint8Array;
}

export interface Payload_MetadataEntry {
  key: string;
  value: Uint8Array;
}

export interface SearchAttributes {
  indexedFields: { [key: string]: Payload };
}

export interface SearchAttributes_IndexedFieldsEntry {
  key: string;
  value: Payload | undefined;
}

export interface Memo {
  fields: { [key: string]: Payload };
}

export interface Memo_FieldsEntry {
  key: string;
  value: Payload | undefined;
}

export interface Header {
  fields: { [key: string]: Payload };
}

export interface Header_FieldsEntry {
  key: string;
  value: Payload | undefined;
}

export interface WorkflowExecution {
  workflowId: string;
  runId: string;
}

export interface WorkflowType {
  name: string;
}

export interface ActivityType {
  name: string;
}

export interface RetryPolicy {
  /** Interval of the first retry. If retryBackoffCoefficient is 1.0 then it is used for all retries. */
  initialInterval: Duration | undefined;
  /**
   * Coefficient used to calculate the next retry interval.
   * The next retry interval is previous interval multiplied by the coefficient.
   * Must be 1 or larger.
   */
  backoffCoefficient: number;
  /**
   * Maximum interval between retries. Exponential backoff leads to interval increase.
   * This value is the cap of the increase. Default is 100x of the initial interval.
   */
  maximumInterval: Duration | undefined;
  /**
   * Maximum number of attempts. When exceeded the retries stop even if not expired yet.
   * 1 disables retries. 0 means unlimited (up to the timeouts)
   */
  maximumAttempts: number;
  /** Non-Retryable errors types. Will stop retrying if error type matches this list. */
  nonRetryableErrorTypes: string[];
}

const baseDataBlob: object = { encodingType: 0 };

export const DataBlob = {
  encode(
    message: DataBlob,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.encodingType !== 0) {
      writer.uint32(8).int32(message.encodingType);
    }
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataBlob {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseDataBlob } as DataBlob;
    message.data = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.encodingType = reader.int32() as any;
          break;
        case 2:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DataBlob {
    const message = { ...baseDataBlob } as DataBlob;
    message.data = new Uint8Array();
    if (object.encodingType !== undefined && object.encodingType !== null) {
      message.encodingType = encodingTypeFromJSON(object.encodingType);
    } else {
      message.encodingType = 0;
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },

  toJSON(message: DataBlob): unknown {
    const obj: any = {};
    message.encodingType !== undefined &&
      (obj.encodingType = encodingTypeToJSON(message.encodingType));
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<DataBlob>): DataBlob {
    const message = { ...baseDataBlob } as DataBlob;
    if (object.encodingType !== undefined && object.encodingType !== null) {
      message.encodingType = object.encodingType;
    } else {
      message.encodingType = 0;
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = object.data;
    } else {
      message.data = new Uint8Array();
    }
    return message;
  },
};

const basePayloads: object = {};

export const Payloads = {
  encode(
    message: Payloads,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    for (const v of message.payloads) {
      Payload.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Payloads {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...basePayloads } as Payloads;
    message.payloads = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.payloads.push(Payload.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Payloads {
    const message = { ...basePayloads } as Payloads;
    message.payloads = [];
    if (object.payloads !== undefined && object.payloads !== null) {
      for (const e of object.payloads) {
        message.payloads.push(Payload.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: Payloads): unknown {
    const obj: any = {};
    if (message.payloads) {
      obj.payloads = message.payloads.map((e) =>
        e ? Payload.toJSON(e) : undefined,
      );
    } else {
      obj.payloads = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<Payloads>): Payloads {
    const message = { ...basePayloads } as Payloads;
    message.payloads = [];
    if (object.payloads !== undefined && object.payloads !== null) {
      for (const e of object.payloads) {
        message.payloads.push(Payload.fromPartial(e));
      }
    }
    return message;
  },
};

const basePayload: object = {};

export const Payload = {
  encode(
    message: Payload,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    Object.entries(message.metadata).forEach(([key, value]) => {
      Payload_MetadataEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork(),
      ).ldelim();
    });
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Payload {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...basePayload } as Payload;
    message.metadata = {};
    message.data = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = Payload_MetadataEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.metadata[entry1.key] = entry1.value;
          }
          break;
        case 2:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Payload {
    const message = { ...basePayload } as Payload;
    message.metadata = {};
    message.data = new Uint8Array();
    if (object.metadata !== undefined && object.metadata !== null) {
      Object.entries(object.metadata).forEach(([key, value]) => {
        message.metadata[key] = bytesFromBase64(value as string);
      });
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },

  toJSON(message: Payload): unknown {
    const obj: any = {};
    obj.metadata = {};
    if (message.metadata) {
      Object.entries(message.metadata).forEach(([k, v]) => {
        obj.metadata[k] = base64FromBytes(v);
      });
    }
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<Payload>): Payload {
    const message = { ...basePayload } as Payload;
    message.metadata = {};
    if (object.metadata !== undefined && object.metadata !== null) {
      Object.entries(object.metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          message.metadata[key] = value;
        }
      });
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = object.data;
    } else {
      message.data = new Uint8Array();
    }
    return message;
  },
};

const basePayload_MetadataEntry: object = { key: '' };

export const Payload_MetadataEntry = {
  encode(
    message: Payload_MetadataEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): Payload_MetadataEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...basePayload_MetadataEntry } as Payload_MetadataEntry;
    message.value = new Uint8Array();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Payload_MetadataEntry {
    const message = { ...basePayload_MetadataEntry } as Payload_MetadataEntry;
    message.value = new Uint8Array();
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = bytesFromBase64(object.value);
    }
    return message;
  },

  toJSON(message: Payload_MetadataEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = base64FromBytes(
        message.value !== undefined ? message.value : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial(
    object: DeepPartial<Payload_MetadataEntry>,
  ): Payload_MetadataEntry {
    const message = { ...basePayload_MetadataEntry } as Payload_MetadataEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    } else {
      message.value = new Uint8Array();
    }
    return message;
  },
};

const baseSearchAttributes: object = {};

export const SearchAttributes = {
  encode(
    message: SearchAttributes,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    Object.entries(message.indexedFields).forEach(([key, value]) => {
      SearchAttributes_IndexedFieldsEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork(),
      ).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchAttributes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseSearchAttributes } as SearchAttributes;
    message.indexedFields = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = SearchAttributes_IndexedFieldsEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry1.value !== undefined) {
            message.indexedFields[entry1.key] = entry1.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SearchAttributes {
    const message = { ...baseSearchAttributes } as SearchAttributes;
    message.indexedFields = {};
    if (object.indexedFields !== undefined && object.indexedFields !== null) {
      Object.entries(object.indexedFields).forEach(([key, value]) => {
        message.indexedFields[key] = Payload.fromJSON(value);
      });
    }
    return message;
  },

  toJSON(message: SearchAttributes): unknown {
    const obj: any = {};
    obj.indexedFields = {};
    if (message.indexedFields) {
      Object.entries(message.indexedFields).forEach(([k, v]) => {
        obj.indexedFields[k] = Payload.toJSON(v);
      });
    }
    return obj;
  },

  fromPartial(object: DeepPartial<SearchAttributes>): SearchAttributes {
    const message = { ...baseSearchAttributes } as SearchAttributes;
    message.indexedFields = {};
    if (object.indexedFields !== undefined && object.indexedFields !== null) {
      Object.entries(object.indexedFields).forEach(([key, value]) => {
        if (value !== undefined) {
          message.indexedFields[key] = Payload.fromPartial(value);
        }
      });
    }
    return message;
  },
};

const baseSearchAttributes_IndexedFieldsEntry: object = { key: '' };

export const SearchAttributes_IndexedFieldsEntry = {
  encode(
    message: SearchAttributes_IndexedFieldsEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Payload.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): SearchAttributes_IndexedFieldsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseSearchAttributes_IndexedFieldsEntry,
    } as SearchAttributes_IndexedFieldsEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = Payload.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SearchAttributes_IndexedFieldsEntry {
    const message = {
      ...baseSearchAttributes_IndexedFieldsEntry,
    } as SearchAttributes_IndexedFieldsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payload.fromJSON(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },

  toJSON(message: SearchAttributes_IndexedFieldsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value ? Payload.toJSON(message.value) : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<SearchAttributes_IndexedFieldsEntry>,
  ): SearchAttributes_IndexedFieldsEntry {
    const message = {
      ...baseSearchAttributes_IndexedFieldsEntry,
    } as SearchAttributes_IndexedFieldsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payload.fromPartial(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },
};

const baseMemo: object = {};

export const Memo = {
  encode(message: Memo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.fields).forEach(([key, value]) => {
      Memo_FieldsEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork(),
      ).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Memo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMemo } as Memo;
    message.fields = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = Memo_FieldsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.fields[entry1.key] = entry1.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Memo {
    const message = { ...baseMemo } as Memo;
    message.fields = {};
    if (object.fields !== undefined && object.fields !== null) {
      Object.entries(object.fields).forEach(([key, value]) => {
        message.fields[key] = Payload.fromJSON(value);
      });
    }
    return message;
  },

  toJSON(message: Memo): unknown {
    const obj: any = {};
    obj.fields = {};
    if (message.fields) {
      Object.entries(message.fields).forEach(([k, v]) => {
        obj.fields[k] = Payload.toJSON(v);
      });
    }
    return obj;
  },

  fromPartial(object: DeepPartial<Memo>): Memo {
    const message = { ...baseMemo } as Memo;
    message.fields = {};
    if (object.fields !== undefined && object.fields !== null) {
      Object.entries(object.fields).forEach(([key, value]) => {
        if (value !== undefined) {
          message.fields[key] = Payload.fromPartial(value);
        }
      });
    }
    return message;
  },
};

const baseMemo_FieldsEntry: object = { key: '' };

export const Memo_FieldsEntry = {
  encode(
    message: Memo_FieldsEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Payload.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Memo_FieldsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMemo_FieldsEntry } as Memo_FieldsEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = Payload.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Memo_FieldsEntry {
    const message = { ...baseMemo_FieldsEntry } as Memo_FieldsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payload.fromJSON(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },

  toJSON(message: Memo_FieldsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value ? Payload.toJSON(message.value) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Memo_FieldsEntry>): Memo_FieldsEntry {
    const message = { ...baseMemo_FieldsEntry } as Memo_FieldsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payload.fromPartial(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },
};

const baseHeader: object = {};

export const Header = {
  encode(
    message: Header,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    Object.entries(message.fields).forEach(([key, value]) => {
      Header_FieldsEntry.encode(
        { key: key as any, value },
        writer.uint32(10).fork(),
      ).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Header {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseHeader } as Header;
    message.fields = {};
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          const entry1 = Header_FieldsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.fields[entry1.key] = entry1.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Header {
    const message = { ...baseHeader } as Header;
    message.fields = {};
    if (object.fields !== undefined && object.fields !== null) {
      Object.entries(object.fields).forEach(([key, value]) => {
        message.fields[key] = Payload.fromJSON(value);
      });
    }
    return message;
  },

  toJSON(message: Header): unknown {
    const obj: any = {};
    obj.fields = {};
    if (message.fields) {
      Object.entries(message.fields).forEach(([k, v]) => {
        obj.fields[k] = Payload.toJSON(v);
      });
    }
    return obj;
  },

  fromPartial(object: DeepPartial<Header>): Header {
    const message = { ...baseHeader } as Header;
    message.fields = {};
    if (object.fields !== undefined && object.fields !== null) {
      Object.entries(object.fields).forEach(([key, value]) => {
        if (value !== undefined) {
          message.fields[key] = Payload.fromPartial(value);
        }
      });
    }
    return message;
  },
};

const baseHeader_FieldsEntry: object = { key: '' };

export const Header_FieldsEntry = {
  encode(
    message: Header_FieldsEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Payload.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Header_FieldsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseHeader_FieldsEntry } as Header_FieldsEntry;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = Payload.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Header_FieldsEntry {
    const message = { ...baseHeader_FieldsEntry } as Header_FieldsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = String(object.key);
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payload.fromJSON(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },

  toJSON(message: Header_FieldsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value ? Payload.toJSON(message.value) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Header_FieldsEntry>): Header_FieldsEntry {
    const message = { ...baseHeader_FieldsEntry } as Header_FieldsEntry;
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    } else {
      message.key = '';
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Payload.fromPartial(object.value);
    } else {
      message.value = undefined;
    }
    return message;
  },
};

const baseWorkflowExecution: object = { workflowId: '', runId: '' };

export const WorkflowExecution = {
  encode(
    message: WorkflowExecution,
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

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowExecution {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWorkflowExecution } as WorkflowExecution;
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

  fromJSON(object: any): WorkflowExecution {
    const message = { ...baseWorkflowExecution } as WorkflowExecution;
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

  toJSON(message: WorkflowExecution): unknown {
    const obj: any = {};
    message.workflowId !== undefined && (obj.workflowId = message.workflowId);
    message.runId !== undefined && (obj.runId = message.runId);
    return obj;
  },

  fromPartial(object: DeepPartial<WorkflowExecution>): WorkflowExecution {
    const message = { ...baseWorkflowExecution } as WorkflowExecution;
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

const baseWorkflowType: object = { name: '' };

export const WorkflowType = {
  encode(
    message: WorkflowType,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowType {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWorkflowType } as WorkflowType;
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

  fromJSON(object: any): WorkflowType {
    const message = { ...baseWorkflowType } as WorkflowType;
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = '';
    }
    return message;
  },

  toJSON(message: WorkflowType): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial(object: DeepPartial<WorkflowType>): WorkflowType {
    const message = { ...baseWorkflowType } as WorkflowType;
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = '';
    }
    return message;
  },
};

const baseActivityType: object = { name: '' };

export const ActivityType = {
  encode(
    message: ActivityType,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ActivityType {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseActivityType } as ActivityType;
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

  fromJSON(object: any): ActivityType {
    const message = { ...baseActivityType } as ActivityType;
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = '';
    }
    return message;
  },

  toJSON(message: ActivityType): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial(object: DeepPartial<ActivityType>): ActivityType {
    const message = { ...baseActivityType } as ActivityType;
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = '';
    }
    return message;
  },
};

const baseRetryPolicy: object = {
  backoffCoefficient: 0,
  maximumAttempts: 0,
  nonRetryableErrorTypes: '',
};

export const RetryPolicy = {
  encode(
    message: RetryPolicy,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.initialInterval !== undefined) {
      Duration.encode(
        message.initialInterval,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.backoffCoefficient !== 0) {
      writer.uint32(17).double(message.backoffCoefficient);
    }
    if (message.maximumInterval !== undefined) {
      Duration.encode(
        message.maximumInterval,
        writer.uint32(26).fork(),
      ).ldelim();
    }
    if (message.maximumAttempts !== 0) {
      writer.uint32(32).int32(message.maximumAttempts);
    }
    for (const v of message.nonRetryableErrorTypes) {
      writer.uint32(42).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RetryPolicy {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRetryPolicy } as RetryPolicy;
    message.nonRetryableErrorTypes = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.initialInterval = Duration.decode(reader, reader.uint32());
          break;
        case 2:
          message.backoffCoefficient = reader.double();
          break;
        case 3:
          message.maximumInterval = Duration.decode(reader, reader.uint32());
          break;
        case 4:
          message.maximumAttempts = reader.int32();
          break;
        case 5:
          message.nonRetryableErrorTypes.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RetryPolicy {
    const message = { ...baseRetryPolicy } as RetryPolicy;
    message.nonRetryableErrorTypes = [];
    if (
      object.initialInterval !== undefined &&
      object.initialInterval !== null
    ) {
      message.initialInterval = Duration.fromJSON(object.initialInterval);
    } else {
      message.initialInterval = undefined;
    }
    if (
      object.backoffCoefficient !== undefined &&
      object.backoffCoefficient !== null
    ) {
      message.backoffCoefficient = Number(object.backoffCoefficient);
    } else {
      message.backoffCoefficient = 0;
    }
    if (
      object.maximumInterval !== undefined &&
      object.maximumInterval !== null
    ) {
      message.maximumInterval = Duration.fromJSON(object.maximumInterval);
    } else {
      message.maximumInterval = undefined;
    }
    if (
      object.maximumAttempts !== undefined &&
      object.maximumAttempts !== null
    ) {
      message.maximumAttempts = Number(object.maximumAttempts);
    } else {
      message.maximumAttempts = 0;
    }
    if (
      object.nonRetryableErrorTypes !== undefined &&
      object.nonRetryableErrorTypes !== null
    ) {
      for (const e of object.nonRetryableErrorTypes) {
        message.nonRetryableErrorTypes.push(String(e));
      }
    }
    return message;
  },

  toJSON(message: RetryPolicy): unknown {
    const obj: any = {};
    message.initialInterval !== undefined &&
      (obj.initialInterval = message.initialInterval
        ? Duration.toJSON(message.initialInterval)
        : undefined);
    message.backoffCoefficient !== undefined &&
      (obj.backoffCoefficient = message.backoffCoefficient);
    message.maximumInterval !== undefined &&
      (obj.maximumInterval = message.maximumInterval
        ? Duration.toJSON(message.maximumInterval)
        : undefined);
    message.maximumAttempts !== undefined &&
      (obj.maximumAttempts = message.maximumAttempts);
    if (message.nonRetryableErrorTypes) {
      obj.nonRetryableErrorTypes = message.nonRetryableErrorTypes.map((e) => e);
    } else {
      obj.nonRetryableErrorTypes = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<RetryPolicy>): RetryPolicy {
    const message = { ...baseRetryPolicy } as RetryPolicy;
    message.nonRetryableErrorTypes = [];
    if (
      object.initialInterval !== undefined &&
      object.initialInterval !== null
    ) {
      message.initialInterval = Duration.fromPartial(object.initialInterval);
    } else {
      message.initialInterval = undefined;
    }
    if (
      object.backoffCoefficient !== undefined &&
      object.backoffCoefficient !== null
    ) {
      message.backoffCoefficient = object.backoffCoefficient;
    } else {
      message.backoffCoefficient = 0;
    }
    if (
      object.maximumInterval !== undefined &&
      object.maximumInterval !== null
    ) {
      message.maximumInterval = Duration.fromPartial(object.maximumInterval);
    } else {
      message.maximumInterval = undefined;
    }
    if (
      object.maximumAttempts !== undefined &&
      object.maximumAttempts !== null
    ) {
      message.maximumAttempts = object.maximumAttempts;
    } else {
      message.maximumAttempts = 0;
    }
    if (
      object.nonRetryableErrorTypes !== undefined &&
      object.nonRetryableErrorTypes !== null
    ) {
      for (const e of object.nonRetryableErrorTypes) {
        message.nonRetryableErrorTypes.push(e);
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

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, 'base64').toString('binary'));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, 'binary').toString('base64'));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  for (const byte of arr) {
    bin.push(String.fromCharCode(byte));
  }
  return btoa(bin.join(''));
}

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
