import type { WorkerStatus as ReadableWorkerStatus } from '$lib/models/worker-status';
import type {
  ArchivalState,
  CallbackState,
  NamespaceState,
  NexusOperationCancellationState,
  PendingNexusOperationState,
  WorkerStatus,
  WorkflowExecutionStatus,
} from '$lib/types';
import type {
  BatchOperationActionType,
  BatchOperationState,
  BatchOperationType,
} from '$lib/types/batch';
import type { PendingActivityState } from '$lib/types/events';
import type {
  SearchAttributeType,
  WorkflowStatus,
  WorkflowTaskFailedCause,
} from '$lib/types/workflows';

import type { EventType } from './is-event-type';

export const fromScreamingEnum = <T>(
  potentialScreamingEnum: T,
  prefix: string,
): T => {
  if (!potentialScreamingEnum) return potentialScreamingEnum;
  const stringEnum = String(potentialScreamingEnum);
  const split = stringEnum.split('_');
  if (!split || split.length <= 1) return potentialScreamingEnum;
  const formatted = split
    .map((word) => {
      return word.charAt(0) + word.substring(1).toLowerCase();
    })
    .join('');
  return formatted.replace(prefix, '') as T;
};

export const toSearchAttributeTypeReadable = (
  status: SearchAttributeType | string,
): SearchAttributeType => {
  return fromScreamingEnum(status, 'IndexedValueType') as SearchAttributeType;
};

export const toWorkflowStatusReadable = (
  status: WorkflowExecutionStatus | WorkflowStatus | string,
): WorkflowStatus => {
  return fromScreamingEnum(status, 'WorkflowExecutionStatus') as WorkflowStatus;
};

export const toNamespaceArchivalStateReadable = (
  status: ArchivalState | string,
): ArchivalState => {
  return fromScreamingEnum(status, 'ArchivalState') as ArchivalState;
};

export const toNamespaceStateReadable = (
  status: NamespaceState | string,
): NamespaceState => {
  return fromScreamingEnum(status, 'NamespaceState') as NamespaceState;
};

export const toEventNameReadable = (status: EventType | string): EventType => {
  return fromScreamingEnum(status, 'EventType') as EventType;
};

export const toBatchOperationStateReadable = (
  status: BatchOperationState | string,
): BatchOperationState => {
  return fromScreamingEnum(
    status,
    'BatchOperationState',
  ) as BatchOperationState;
};

export const toBatchOperationTypeReadable = (
  status: BatchOperationType | string,
): BatchOperationActionType => {
  return fromScreamingEnum(
    status,
    'BatchOperationType',
  ) as unknown as BatchOperationActionType;
};

export const toWorkflowTaskFailureReadable = (
  cause?: WorkflowTaskFailedCause | string,
): WorkflowTaskFailedCause => {
  if (!cause) return 'Unspecified';
  return fromScreamingEnum(
    cause,
    'WorkflowTaskFailedCause',
  ) as WorkflowTaskFailedCause;
};

export const toPendingActivityStateReadable = (
  state?: PendingActivityState,
): PendingActivityState => {
  if (!state) return 'Unspecified';
  return fromScreamingEnum(state, 'PendingActivityState');
};

export const toPendingNexusOperationStateReadable = (
  state?: PendingNexusOperationState,
): PendingNexusOperationState => {
  if (!state) return 'Unspecified' as unknown as PendingNexusOperationState;
  return fromScreamingEnum(state, 'PendingNexusOperationState');
};

export const toNexusOperationCancellationStateReadable = (
  state?: NexusOperationCancellationState | null,
): string => {
  if (!state) return 'Unspecified';
  return fromScreamingEnum(
    state,
    'NexusOperationCancellationState',
  ) as unknown as string;
};

export const toCallbackStateReadable = (
  state?: CallbackState,
): CallbackState => {
  if (!state) return 'Unspecified' as unknown as CallbackState;
  return fromScreamingEnum(state, 'CallbackState');
};

export const toWorkerStatusReadable = (
  state: WorkerStatus | undefined | null,
): ReadableWorkerStatus => {
  if (!state) return 'Unspecified';
  return fromScreamingEnum(
    state,
    'WorkerStatus',
  ) as unknown as ReadableWorkerStatus;
};
