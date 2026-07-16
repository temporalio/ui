import type { temporal } from '@temporalio/proto';

import type {
  ActivityType,
  Failure,
  Payloads,
  SearchAttribute,
  TaskQueue,
  UserMetadata,
} from '.';
import type { WorkflowSearchAttributes } from './workflows';

// TODO: Use @temporalio/proto once updated

export type ActivityExecutionStatus =
  | 'ACTIVITY_EXECUTION_STATUS_UNSPECIFIED'
  | 'ACTIVITY_EXECUTION_STATUS_RUNNING'
  | 'ACTIVITY_EXECUTION_STATUS_COMPLETED'
  | 'ACTIVITY_EXECUTION_STATUS_FAILED'
  | 'ACTIVITY_EXECUTION_STATUS_CANCELED'
  | 'ACTIVITY_EXECUTION_STATUS_TERMINATED'
  | 'ACTIVITY_EXECUTION_STATUS_TIMED_OUT';

export const ACTIVITY_ID_REUSE_POLICIES = [
  'ACTIVITY_ID_REUSE_POLICY_UNSPECIFIED',
  'ACTIVITY_ID_REUSE_POLICY_ALLOW_DUPLICATE',
  'ACTIVITY_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY',
  'ACTIVITY_ID_REUSE_POLICY_REJECT_DUPLICATE',
] as const;

export const ACTIVITY_ID_CONFLICT_POLICIES = [
  'ACTIVITY_ID_CONFLICT_POLICY_UNSPECIFIED',
  'ACTIVITY_ID_CONFLICT_POLICY_FAIL',
  'ACTIVITY_ID_CONFLICT_POLICY_USE_EXISTING',
] as const;

export type ActivityIdReusePolicy = (typeof ACTIVITY_ID_REUSE_POLICIES)[number];
export type ActivityIdConflictPolicy =
  (typeof ACTIVITY_ID_CONFLICT_POLICIES)[number];

export const activityIDReusePolicyOptions = ACTIVITY_ID_REUSE_POLICIES.filter(
  (policy) => policy !== 'ACTIVITY_ID_REUSE_POLICY_UNSPECIFIED',
);
export const activityIDConflictPolicyOptions =
  ACTIVITY_ID_CONFLICT_POLICIES.filter(
    (policy) => policy !== 'ACTIVITY_ID_CONFLICT_POLICY_UNSPECIFIED',
  );

export type ActivityExecutionOutcome =
  | {
      result: Payloads;
    }
  | {
      failure: Failure;
    };

interface RetryPolicy {
  initialInterval: string;
  backoffCoefficient: number;
  maximumInterval: string;
  maximumAttempts: number;
}

export interface ActivityExecutionInfo extends Omit<
  temporal.api.activity.v1.IActivityExecutionInfo,
  | 'status'
  | 'runState'
  | 'scheduleToCloseTimeout'
  | 'scheduleToStartTimeout'
  | 'startToCloseTimeout'
  | 'heartbeatTimeout'
  | 'executionDuration'
  | 'stateTransitionCount'
  | 'currentRetryInterval'
> {
  status: ActivityExecutionStatus;
  runState?: string; // only for running activities
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  startToCloseTimeout: string;
  heartbeatTimeout: string;
  executionDuration?: string;
  stateTransitionCount: string;
  currentRetryInterval: string;
  searchAttributes: WorkflowSearchAttributes;
  sdkName?: string;
  sdkVersion?: string;
}

export interface ActivityExecution {
  runId: string;
  info: ActivityExecutionInfo;
  input?: Payloads;
  outcome?: ActivityExecutionOutcome;
  longPollToken?: string;
}

export interface StartActivityExecutionRequest {
  namespace: string;
  identity: string;
  requestId: string;
  activityId: string;
  activityType: ActivityType;
  taskQueue: TaskQueue;
  startToCloseTimeout: string;
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  input?: Payloads;
  userMetadata?: UserMetadata;
  retryPolicy?: Partial<RetryPolicy>;
  searchAttributes?: SearchAttribute;
}
