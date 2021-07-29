/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.enums.v1';

export enum EncodingType {
  ENCODING_TYPE_UNSPECIFIED = 0,
  ENCODING_TYPE_PROTO3 = 1,
  ENCODING_TYPE_JSON = 2,
  UNRECOGNIZED = -1,
}

export function encodingTypeFromJSON(object: any): EncodingType {
  switch (object) {
    case 0:
    case 'ENCODING_TYPE_UNSPECIFIED':
      return EncodingType.ENCODING_TYPE_UNSPECIFIED;
    case 1:
    case 'ENCODING_TYPE_PROTO3':
      return EncodingType.ENCODING_TYPE_PROTO3;
    case 2:
    case 'ENCODING_TYPE_JSON':
      return EncodingType.ENCODING_TYPE_JSON;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return EncodingType.UNRECOGNIZED;
  }
}

export function encodingTypeToJSON(object: EncodingType): string {
  switch (object) {
    case EncodingType.ENCODING_TYPE_UNSPECIFIED:
      return 'ENCODING_TYPE_UNSPECIFIED';
    case EncodingType.ENCODING_TYPE_PROTO3:
      return 'ENCODING_TYPE_PROTO3';
    case EncodingType.ENCODING_TYPE_JSON:
      return 'ENCODING_TYPE_JSON';
    default:
      return 'UNKNOWN';
  }
}

export enum IndexedValueType {
  INDEXED_VALUE_TYPE_UNSPECIFIED = 0,
  INDEXED_VALUE_TYPE_STRING = 1,
  INDEXED_VALUE_TYPE_KEYWORD = 2,
  INDEXED_VALUE_TYPE_INT = 3,
  INDEXED_VALUE_TYPE_DOUBLE = 4,
  INDEXED_VALUE_TYPE_BOOL = 5,
  INDEXED_VALUE_TYPE_DATETIME = 6,
  UNRECOGNIZED = -1,
}

export function indexedValueTypeFromJSON(object: any): IndexedValueType {
  switch (object) {
    case 0:
    case 'INDEXED_VALUE_TYPE_UNSPECIFIED':
      return IndexedValueType.INDEXED_VALUE_TYPE_UNSPECIFIED;
    case 1:
    case 'INDEXED_VALUE_TYPE_STRING':
      return IndexedValueType.INDEXED_VALUE_TYPE_STRING;
    case 2:
    case 'INDEXED_VALUE_TYPE_KEYWORD':
      return IndexedValueType.INDEXED_VALUE_TYPE_KEYWORD;
    case 3:
    case 'INDEXED_VALUE_TYPE_INT':
      return IndexedValueType.INDEXED_VALUE_TYPE_INT;
    case 4:
    case 'INDEXED_VALUE_TYPE_DOUBLE':
      return IndexedValueType.INDEXED_VALUE_TYPE_DOUBLE;
    case 5:
    case 'INDEXED_VALUE_TYPE_BOOL':
      return IndexedValueType.INDEXED_VALUE_TYPE_BOOL;
    case 6:
    case 'INDEXED_VALUE_TYPE_DATETIME':
      return IndexedValueType.INDEXED_VALUE_TYPE_DATETIME;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return IndexedValueType.UNRECOGNIZED;
  }
}

export function indexedValueTypeToJSON(object: IndexedValueType): string {
  switch (object) {
    case IndexedValueType.INDEXED_VALUE_TYPE_UNSPECIFIED:
      return 'INDEXED_VALUE_TYPE_UNSPECIFIED';
    case IndexedValueType.INDEXED_VALUE_TYPE_STRING:
      return 'INDEXED_VALUE_TYPE_STRING';
    case IndexedValueType.INDEXED_VALUE_TYPE_KEYWORD:
      return 'INDEXED_VALUE_TYPE_KEYWORD';
    case IndexedValueType.INDEXED_VALUE_TYPE_INT:
      return 'INDEXED_VALUE_TYPE_INT';
    case IndexedValueType.INDEXED_VALUE_TYPE_DOUBLE:
      return 'INDEXED_VALUE_TYPE_DOUBLE';
    case IndexedValueType.INDEXED_VALUE_TYPE_BOOL:
      return 'INDEXED_VALUE_TYPE_BOOL';
    case IndexedValueType.INDEXED_VALUE_TYPE_DATETIME:
      return 'INDEXED_VALUE_TYPE_DATETIME';
    default:
      return 'UNKNOWN';
  }
}

export enum Severity {
  SEVERITY_UNSPECIFIED = 0,
  SEVERITY_HIGH = 1,
  SEVERITY_MEDIUM = 2,
  SEVERITY_LOW = 3,
  UNRECOGNIZED = -1,
}

export function severityFromJSON(object: any): Severity {
  switch (object) {
    case 0:
    case 'SEVERITY_UNSPECIFIED':
      return Severity.SEVERITY_UNSPECIFIED;
    case 1:
    case 'SEVERITY_HIGH':
      return Severity.SEVERITY_HIGH;
    case 2:
    case 'SEVERITY_MEDIUM':
      return Severity.SEVERITY_MEDIUM;
    case 3:
    case 'SEVERITY_LOW':
      return Severity.SEVERITY_LOW;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return Severity.UNRECOGNIZED;
  }
}

export function severityToJSON(object: Severity): string {
  switch (object) {
    case Severity.SEVERITY_UNSPECIFIED:
      return 'SEVERITY_UNSPECIFIED';
    case Severity.SEVERITY_HIGH:
      return 'SEVERITY_HIGH';
    case Severity.SEVERITY_MEDIUM:
      return 'SEVERITY_MEDIUM';
    case Severity.SEVERITY_LOW:
      return 'SEVERITY_LOW';
    default:
      return 'UNKNOWN';
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
