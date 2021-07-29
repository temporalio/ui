/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.enums.v1';

export enum QueryResultType {
  QUERY_RESULT_TYPE_UNSPECIFIED = 0,
  QUERY_RESULT_TYPE_ANSWERED = 1,
  QUERY_RESULT_TYPE_FAILED = 2,
  UNRECOGNIZED = -1,
}

export function queryResultTypeFromJSON(object: any): QueryResultType {
  switch (object) {
    case 0:
    case 'QUERY_RESULT_TYPE_UNSPECIFIED':
      return QueryResultType.QUERY_RESULT_TYPE_UNSPECIFIED;
    case 1:
    case 'QUERY_RESULT_TYPE_ANSWERED':
      return QueryResultType.QUERY_RESULT_TYPE_ANSWERED;
    case 2:
    case 'QUERY_RESULT_TYPE_FAILED':
      return QueryResultType.QUERY_RESULT_TYPE_FAILED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return QueryResultType.UNRECOGNIZED;
  }
}

export function queryResultTypeToJSON(object: QueryResultType): string {
  switch (object) {
    case QueryResultType.QUERY_RESULT_TYPE_UNSPECIFIED:
      return 'QUERY_RESULT_TYPE_UNSPECIFIED';
    case QueryResultType.QUERY_RESULT_TYPE_ANSWERED:
      return 'QUERY_RESULT_TYPE_ANSWERED';
    case QueryResultType.QUERY_RESULT_TYPE_FAILED:
      return 'QUERY_RESULT_TYPE_FAILED';
    default:
      return 'UNKNOWN';
  }
}

export enum QueryRejectCondition {
  QUERY_REJECT_CONDITION_UNSPECIFIED = 0,
  /** QUERY_REJECT_CONDITION_NONE - None indicates that query should not be rejected. */
  QUERY_REJECT_CONDITION_NONE = 1,
  /** QUERY_REJECT_CONDITION_NOT_OPEN - NotOpen indicates that query should be rejected if workflow is not open. */
  QUERY_REJECT_CONDITION_NOT_OPEN = 2,
  /** QUERY_REJECT_CONDITION_NOT_COMPLETED_CLEANLY - NotCompletedCleanly indicates that query should be rejected if workflow did not complete cleanly. */
  QUERY_REJECT_CONDITION_NOT_COMPLETED_CLEANLY = 3,
  UNRECOGNIZED = -1,
}

export function queryRejectConditionFromJSON(
  object: any,
): QueryRejectCondition {
  switch (object) {
    case 0:
    case 'QUERY_REJECT_CONDITION_UNSPECIFIED':
      return QueryRejectCondition.QUERY_REJECT_CONDITION_UNSPECIFIED;
    case 1:
    case 'QUERY_REJECT_CONDITION_NONE':
      return QueryRejectCondition.QUERY_REJECT_CONDITION_NONE;
    case 2:
    case 'QUERY_REJECT_CONDITION_NOT_OPEN':
      return QueryRejectCondition.QUERY_REJECT_CONDITION_NOT_OPEN;
    case 3:
    case 'QUERY_REJECT_CONDITION_NOT_COMPLETED_CLEANLY':
      return QueryRejectCondition.QUERY_REJECT_CONDITION_NOT_COMPLETED_CLEANLY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return QueryRejectCondition.UNRECOGNIZED;
  }
}

export function queryRejectConditionToJSON(
  object: QueryRejectCondition,
): string {
  switch (object) {
    case QueryRejectCondition.QUERY_REJECT_CONDITION_UNSPECIFIED:
      return 'QUERY_REJECT_CONDITION_UNSPECIFIED';
    case QueryRejectCondition.QUERY_REJECT_CONDITION_NONE:
      return 'QUERY_REJECT_CONDITION_NONE';
    case QueryRejectCondition.QUERY_REJECT_CONDITION_NOT_OPEN:
      return 'QUERY_REJECT_CONDITION_NOT_OPEN';
    case QueryRejectCondition.QUERY_REJECT_CONDITION_NOT_COMPLETED_CLEANLY:
      return 'QUERY_REJECT_CONDITION_NOT_COMPLETED_CLEANLY';
    default:
      return 'UNKNOWN';
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
