import { temporal } from '@temporalio/proto';

import type {
  DescribeNexusOperationResponse,
  NexusOperationIdConflictPolicy,
  NexusOperationIdReusePolicy,
  StartNexusOperationExecutionRequest,
  UserMetadata,
} from '.';
import type { WorkflowSearchAttributes } from './workflows';

export type NexusOperationExecutionStatus =
  keyof typeof temporal.api.enums.v1.NexusOperationExecutionStatus;

export const NEXUS_OPERATION_ID_REUSE_POLICIES = Object.keys(
  temporal.api.enums.v1.NexusOperationIdReusePolicy,
) as (keyof typeof temporal.api.enums.v1.NexusOperationIdReusePolicy)[];

export const NEXUS_OPERATION_ID_CONFLICT_POLICIES = Object.keys(
  temporal.api.enums.v1.NexusOperationIdConflictPolicy,
) as (keyof typeof temporal.api.enums.v1.NexusOperationIdConflictPolicy)[];

export const nexusOperationIdReusePolicyOptions =
  NEXUS_OPERATION_ID_REUSE_POLICIES.filter(
    (policy) => policy !== 'NEXUS_OPERATION_ID_REUSE_POLICY_UNSPECIFIED',
  );
export const nexusOperationIdConflictPolicyOptions =
  NEXUS_OPERATION_ID_CONFLICT_POLICIES.filter(
    (policy) => policy !== 'NEXUS_OPERATION_ID_CONFLICT_POLICY_UNSPECIFIED',
  );

export interface NexusOperationExecutionCancellationInfo extends Omit<
  temporal.api.nexus.v1.INexusOperationExecutionCancellationInfo,
  'requestedTime' | 'lastAttemptCompleteTime' | 'nextAttemptScheduleTime'
> {
  requestedTime: string;
  lastAttemptCompleteTime: string;
  nextAttemptScheduleTime: string;
}

export interface NexusOperationExecutionInfo extends Omit<
  temporal.api.nexus.v1.INexusOperationExecutionInfo,
  | 'status'
  | 'scheduleToCloseTimeout'
  | 'scheduleToStartTimeout'
  | 'startToCloseTimeout'
  | 'executionDuration'
  | 'stateTransitionCount'
  | 'scheduleTime'
  | 'expirationTime'
  | 'closeTime'
  | 'lastAttemptCompleteTime'
  | 'nextAttemptScheduleTime'
  | 'searchAttributes'
  | 'cancellationInfo'
> {
  status: NexusOperationExecutionStatus;
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  startToCloseTimeout: string;
  executionDuration: string;
  stateTransitionCount: string;
  scheduleTime: string;
  expirationTime: string;
  closeTime: string;
  lastAttemptCompleteTime: string;
  nextAttemptScheduleTime: string;
  searchAttributes: WorkflowSearchAttributes;
  cancellationInfo?: NexusOperationExecutionCancellationInfo;
}

export interface NexusOperationExecutionListInfo extends Omit<
  temporal.api.nexus.v1.INexusOperationExecutionListInfo,
  | 'status'
  | 'scheduleTime'
  | 'closeTime'
  | 'stateTransitionCount'
  | 'executionDuration'
  | 'searchAttributes'
> {
  status: NexusOperationExecutionStatus;
  scheduleTime: string;
  closeTime: string;
  stateTransitionCount: string;
  executionDuration: string;
  searchAttributes: WorkflowSearchAttributes;
}

export interface NexusOperationExecution extends Omit<
  DescribeNexusOperationResponse,
  'info' | 'longPollToken'
> {
  info: NexusOperationExecutionInfo;
  longPollToken?: string;
}

export interface StartNexusOperationRequest extends Omit<
  StartNexusOperationExecutionRequest,
  | 'scheduleToCloseTimeout'
  | 'startToCloseTimeout'
  | 'scheduleToStartTimeout'
  | 'idReusePolicy'
  | 'idConflictPolicy'
> {
  scheduleToCloseTimeout?: string;
  startToCloseTimeout?: string;
  scheduleToStartTimeout?: string;
  idReusePolicy?: NexusOperationIdReusePolicy;
  idConflictPolicy?: NexusOperationIdConflictPolicy;
}
