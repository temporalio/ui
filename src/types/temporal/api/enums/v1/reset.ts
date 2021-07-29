/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.enums.v1';

export enum ResetReapplyType {
  RESET_REAPPLY_TYPE_UNSPECIFIED = 0,
  RESET_REAPPLY_TYPE_SIGNAL = 1,
  RESET_REAPPLY_TYPE_NONE = 2,
  UNRECOGNIZED = -1,
}

export function resetReapplyTypeFromJSON(object: any): ResetReapplyType {
  switch (object) {
    case 0:
    case 'RESET_REAPPLY_TYPE_UNSPECIFIED':
      return ResetReapplyType.RESET_REAPPLY_TYPE_UNSPECIFIED;
    case 1:
    case 'RESET_REAPPLY_TYPE_SIGNAL':
      return ResetReapplyType.RESET_REAPPLY_TYPE_SIGNAL;
    case 2:
    case 'RESET_REAPPLY_TYPE_NONE':
      return ResetReapplyType.RESET_REAPPLY_TYPE_NONE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ResetReapplyType.UNRECOGNIZED;
  }
}

export function resetReapplyTypeToJSON(object: ResetReapplyType): string {
  switch (object) {
    case ResetReapplyType.RESET_REAPPLY_TYPE_UNSPECIFIED:
      return 'RESET_REAPPLY_TYPE_UNSPECIFIED';
    case ResetReapplyType.RESET_REAPPLY_TYPE_SIGNAL:
      return 'RESET_REAPPLY_TYPE_SIGNAL';
    case ResetReapplyType.RESET_REAPPLY_TYPE_NONE:
      return 'RESET_REAPPLY_TYPE_NONE';
    default:
      return 'UNKNOWN';
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
