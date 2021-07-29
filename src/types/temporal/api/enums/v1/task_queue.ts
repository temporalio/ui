/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.enums.v1';

export enum TaskQueueKind {
  TASK_QUEUE_KIND_UNSPECIFIED = 0,
  TASK_QUEUE_KIND_NORMAL = 1,
  TASK_QUEUE_KIND_STICKY = 2,
  UNRECOGNIZED = -1,
}

export function taskQueueKindFromJSON(object: any): TaskQueueKind {
  switch (object) {
    case 0:
    case 'TASK_QUEUE_KIND_UNSPECIFIED':
      return TaskQueueKind.TASK_QUEUE_KIND_UNSPECIFIED;
    case 1:
    case 'TASK_QUEUE_KIND_NORMAL':
      return TaskQueueKind.TASK_QUEUE_KIND_NORMAL;
    case 2:
    case 'TASK_QUEUE_KIND_STICKY':
      return TaskQueueKind.TASK_QUEUE_KIND_STICKY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return TaskQueueKind.UNRECOGNIZED;
  }
}

export function taskQueueKindToJSON(object: TaskQueueKind): string {
  switch (object) {
    case TaskQueueKind.TASK_QUEUE_KIND_UNSPECIFIED:
      return 'TASK_QUEUE_KIND_UNSPECIFIED';
    case TaskQueueKind.TASK_QUEUE_KIND_NORMAL:
      return 'TASK_QUEUE_KIND_NORMAL';
    case TaskQueueKind.TASK_QUEUE_KIND_STICKY:
      return 'TASK_QUEUE_KIND_STICKY';
    default:
      return 'UNKNOWN';
  }
}

export enum TaskQueueType {
  TASK_QUEUE_TYPE_UNSPECIFIED = 0,
  /** TASK_QUEUE_TYPE_WORKFLOW - Workflow type of task queue. */
  TASK_QUEUE_TYPE_WORKFLOW = 1,
  /** TASK_QUEUE_TYPE_ACTIVITY - Activity type of task queue. */
  TASK_QUEUE_TYPE_ACTIVITY = 2,
  UNRECOGNIZED = -1,
}

export function taskQueueTypeFromJSON(object: any): TaskQueueType {
  switch (object) {
    case 0:
    case 'TASK_QUEUE_TYPE_UNSPECIFIED':
      return TaskQueueType.TASK_QUEUE_TYPE_UNSPECIFIED;
    case 1:
    case 'TASK_QUEUE_TYPE_WORKFLOW':
      return TaskQueueType.TASK_QUEUE_TYPE_WORKFLOW;
    case 2:
    case 'TASK_QUEUE_TYPE_ACTIVITY':
      return TaskQueueType.TASK_QUEUE_TYPE_ACTIVITY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return TaskQueueType.UNRECOGNIZED;
  }
}

export function taskQueueTypeToJSON(object: TaskQueueType): string {
  switch (object) {
    case TaskQueueType.TASK_QUEUE_TYPE_UNSPECIFIED:
      return 'TASK_QUEUE_TYPE_UNSPECIFIED';
    case TaskQueueType.TASK_QUEUE_TYPE_WORKFLOW:
      return 'TASK_QUEUE_TYPE_WORKFLOW';
    case TaskQueueType.TASK_QUEUE_TYPE_ACTIVITY:
      return 'TASK_QUEUE_TYPE_ACTIVITY';
    default:
      return 'UNKNOWN';
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
