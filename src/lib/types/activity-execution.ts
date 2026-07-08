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

// Enum values arrive over REST/JSON as their SCREAMING_SNAKE names, so these are
// string unions of the proto enum keys (not the numeric proto enum). Keying off
// the generated proto enums ties them to the current API so they can't drift.
export type ActivityExecutionStatus =
  keyof typeof import('@temporalio/proto').temporal.api.enums.v1.ActivityExecutionStatus;

export type ActivityIdReusePolicy =
  keyof typeof import('@temporalio/proto').temporal.api.enums.v1.ActivityIdReusePolicy;

export type ActivityIdConflictPolicy =
  keyof typeof import('@temporalio/proto').temporal.api.enums.v1.ActivityIdConflictPolicy;

export const ACTIVITY_ID_REUSE_POLICIES = [
  'ACTIVITY_ID_REUSE_POLICY_UNSPECIFIED',
  'ACTIVITY_ID_REUSE_POLICY_ALLOW_DUPLICATE',
  'ACTIVITY_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY',
  'ACTIVITY_ID_REUSE_POLICY_REJECT_DUPLICATE',
] as const satisfies readonly ActivityIdReusePolicy[];

export const ACTIVITY_ID_CONFLICT_POLICIES = [
  'ACTIVITY_ID_CONFLICT_POLICY_UNSPECIFIED',
  'ACTIVITY_ID_CONFLICT_POLICY_FAIL',
  'ACTIVITY_ID_CONFLICT_POLICY_USE_EXISTING',
] as const satisfies readonly ActivityIdConflictPolicy[];

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
  executionTime?: string;
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
