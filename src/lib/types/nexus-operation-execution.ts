import type {
  EventLink,
  Failure,
  Payload,
  SearchAttribute,
  UserMetadata,
} from '.';
import type { WorkflowSearchAttributes } from './workflows';

export type NexusOperationExecutionStatus =
  | 'NEXUS_OPERATION_EXECUTION_STATUS_UNSPECIFIED'
  | 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING'
  | 'NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED'
  | 'NEXUS_OPERATION_EXECUTION_STATUS_FAILED'
  | 'NEXUS_OPERATION_EXECUTION_STATUS_CANCELED'
  | 'NEXUS_OPERATION_EXECUTION_STATUS_TERMINATED'
  | 'NEXUS_OPERATION_EXECUTION_STATUS_TIMED_OUT';

export const NEXUS_OPERATION_ID_REUSE_POLICIES = [
  'NEXUS_OPERATION_ID_REUSE_POLICY_UNSPECIFIED',
  'NEXUS_OPERATION_ID_REUSE_POLICY_ALLOW_DUPLICATE',
  'NEXUS_OPERATION_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY',
  'NEXUS_OPERATION_ID_REUSE_POLICY_REJECT_DUPLICATE',
] as const;

export const NEXUS_OPERATION_ID_CONFLICT_POLICIES = [
  'NEXUS_OPERATION_ID_CONFLICT_POLICY_UNSPECIFIED',
  'NEXUS_OPERATION_ID_CONFLICT_POLICY_FAIL',
  'NEXUS_OPERATION_ID_CONFLICT_POLICY_USE_EXISTING',
] as const;

export type NexusOperationIdReusePolicy =
  (typeof NEXUS_OPERATION_ID_REUSE_POLICIES)[number];
export type NexusOperationIdConflictPolicy =
  (typeof NEXUS_OPERATION_ID_CONFLICT_POLICIES)[number];

export const nexusOperationIdReusePolicyOptions =
  NEXUS_OPERATION_ID_REUSE_POLICIES.filter(
    (policy) => policy !== 'NEXUS_OPERATION_ID_REUSE_POLICY_UNSPECIFIED',
  );
export const nexusOperationIdConflictPolicyOptions =
  NEXUS_OPERATION_ID_CONFLICT_POLICIES.filter(
    (policy) => policy !== 'NEXUS_OPERATION_ID_CONFLICT_POLICY_UNSPECIFIED',
  );

export interface NexusOperationExecutionCancellationInfo {
  requestedTime: string;
  state: string;
  attempt: number;
  lastAttemptCompleteTime: string;
  lastAttemptFailure?: Failure;
  nextAttemptScheduleTime: string;
  blockedReason: string;
  reason: string;
}

export interface NexusOperationExecutionInfo {
  operationId: string;
  runId: string;
  endpoint: string;
  service: string;
  operation: string;
  status: NexusOperationExecutionStatus;
  state: string;
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  startToCloseTimeout: string;
  attempt: number;
  scheduleTime: string;
  expirationTime: string;
  closeTime: string;
  lastAttemptCompleteTime: string;
  lastAttemptFailure?: Failure;
  nextAttemptScheduleTime: string;
  executionDuration: string;
  cancellationInfo?: NexusOperationExecutionCancellationInfo;
  blockedReason: string;
  requestId: string;
  operationToken: string;
  stateTransitionCount: string;
  searchAttributes: WorkflowSearchAttributes;
  nexusHeader: Record<string, string>;
  userMetadata: UserMetadata;
  links: EventLink[];
  identity: string;
}

export interface NexusOperationExecutionListInfo {
  operationId: string;
  runId: string;
  endpoint: string;
  service: string;
  operation: string;
  scheduleTime: string;
  closeTime: string;
  status: NexusOperationExecutionStatus;
  searchAttributes: WorkflowSearchAttributes;
  stateTransitionCount: string;
  executionDuration: string;
}

export interface NexusOperationExecution {
  runId: string;
  info: NexusOperationExecutionInfo;
  input?: Payload;
  result?: Payload;
  failure?: Failure;
  longPollToken?: string;
}
export interface StartNexusOperationExecutionRequest {
  namespace: string;
  identity: string;
  requestId: string;
  operationId: string;
  endpoint: string;
  service: string;
  operation: string;
  scheduleToCloseTimeout?: string;
  scheduleToStartTimeout?: string;
  startToCloseTimeout?: string;
  input?: Payload;
  idReusePolicy?: NexusOperationIdReusePolicy;
  idConflictPolicy?: NexusOperationIdConflictPolicy;
  searchAttributes?: SearchAttribute;
  nexusHeader?: Record<string, string>;
  userMetadata?: UserMetadata;
}

export interface StartNexusOperationExecutionResponse {
  runId: string;
  started: boolean;
}
