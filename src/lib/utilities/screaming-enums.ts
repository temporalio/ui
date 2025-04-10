import type { ListSearchAttributesResponse } from '$lib/schemas';
import type {
  ArchivalState,
  CallbackState,
  NamespaceState,
  PendingNexusOperationState,
  WorkflowExecutionStatus,
} from '$lib/types';
import type { BatchOperationState, BatchOperationType } from '$lib/types/batch';
import type {
  SearchAttributeType,
  WorkflowStatus,
  WorkflowTaskFailedCause,
} from '$lib/types/workflows';

import type { EventType } from './is-event-type';

export const fromScreamingEnum = <T, V>(
  potentialScreamingEnum: V,
  prefix: string,
): T | V => {
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
  status:
    | ListSearchAttributesResponse['customAttributes'][string]
    | ListSearchAttributesResponse['systemAttributes'][string]
    | SearchAttributeType,
): typeof status => {
  return fromScreamingEnum(status, 'IndexedValueType');
};

export const toWorkflowStatusReadable = (
  status: WorkflowExecutionStatus | WorkflowStatus,
): WorkflowStatus => {
  return fromScreamingEnum(status, 'WorkflowExecutionStatus') as WorkflowStatus;
};

export const toNamespaceArchivalStateReadable = (
  status: ArchivalState,
): ArchivalState => {
  return fromScreamingEnum(status, 'ArchivalState');
};

export const toNamespaceStateReadable = (
  status: NamespaceState,
): NamespaceState => {
  return fromScreamingEnum(status, 'NamespaceState');
};

export const toEventNameReadable = (status: EventType): EventType => {
  return fromScreamingEnum(status, 'EventType');
};

export const toBatchOperationStateReadable = (
  status: BatchOperationState,
): BatchOperationState => {
  return fromScreamingEnum(status, 'BatchOperationState');
};

export const toBatchOperationTypeReadable = (
  status: BatchOperationType,
): BatchOperationType => {
  return fromScreamingEnum(status, 'BatchOperationType');
};

export const toWorkflowTaskFailureReadable = (
  cause?: WorkflowTaskFailedCause,
): WorkflowTaskFailedCause => {
  if (!cause) return 'Unspecified';
  return fromScreamingEnum(cause, 'WorkflowTaskFailedCause');
};

export const toPendingNexusOperationStateReadable = (
  state?: PendingNexusOperationState,
): PendingNexusOperationState => {
  if (!state) return state;
  return fromScreamingEnum(state, 'PendingNexusOperationState');
};

export const toCallbackStateReadable = (
  state?: CallbackState,
): CallbackState => {
  if (!state) return state;
  return fromScreamingEnum(state, 'CallbackState');
};
