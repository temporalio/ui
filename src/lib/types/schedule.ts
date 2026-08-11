import type { temporal } from '@temporalio/proto';

import type {
  DescribeScheduleResponse,
  Duration,
  IntervalSpec,
  Schedule,
  ScheduleActionResult,
  SchedulePolicies,
  ScheduleSpec,
  ScheduleState,
  SearchAttribute,
  StructuredCalendarSpec,
} from '$lib/types';
import type { WorkflowStatus } from '$lib/types/workflows';

type Override<T, U> = Omit<T, keyof U> & U;

/**
 * Duration as encoded by the Temporal HTTP API: a whole number of seconds
 * suffixed with `s` (e.g. `"30s"`), rather than the protobuf IDuration object.
 */
export type DurationString = `${number}s`;

export type ScheduleSpecResponse = Override<
  ScheduleSpec,
  {
    jitter?: DurationString;
  }
>;

export type ScheduleResponse = Override<
  Schedule,
  {
    spec?: ScheduleSpecResponse | null;
  }
>;

export type DescribeFullSchedule = DescribeScheduleResponse & {
  schedule_id: string;
  schedule?: ScheduleResponse;
};

/**
 * A row in the schedule's recent runs list. `status` and `runId` start out as
 * the ones recorded on the action; once visibility answers they are replaced
 * by the matching execution's, which for a continue-as-new chain is the latest
 * run rather than the one the schedule started.
 */
export type RecentScheduleRun = {
  workflowId: string;
  runId: string;
  actualTime: ScheduleActionResult['actualTime'];
  status: WorkflowStatus;
};

/**
 * Schedule create/edit request bodies. The Temporal HTTP API encodes durations
 * and timestamps as strings, enums as their string names and 64-bit integers as
 * numbers, so these diverge from the protobuf interfaces returned by Describe.
 */
export type ScheduleSpecRequest = Override<
  ScheduleSpec,
  {
    startTime?: string;
    endTime?: string;
    jitter?: string;
  }
>;

export type StartWorkflowRequest = Override<
  temporal.api.workflow.v1.INewWorkflowExecutionInfo,
  {
    workflowExecutionTimeout?: Duration | string | null;
    workflowRunTimeout?: Duration | string | null;
    workflowTaskTimeout?: Duration | string | null;
  }
>;

export type ScheduleActionRequest = {
  startWorkflow: StartWorkflowRequest;
};

export type SchedulePoliciesRequest = Override<
  SchedulePolicies,
  {
    overlapPolicy?: OverlapPolicy;
    catchupWindow?: string;
  }
>;

export type ScheduleStateRequest = Override<
  ScheduleState,
  {
    remainingActions?: ScheduleState['remainingActions'] | number;
  }
>;

export type ScheduleRequest = Override<
  Schedule,
  {
    spec?: ScheduleSpecRequest;
    action?: ScheduleActionRequest;
    policies?: SchedulePoliciesRequest;
    state?: ScheduleStateRequest;
  }
>;

export type ScheduleRequestBody = {
  schedule_id: string;
  searchAttributes?: SearchAttribute | null;
  schedule: ScheduleRequest;
};

export type StructuredCalendar = StructuredCalendarSpec;
export type ScheduleInterval = IntervalSpec;

export type ScheduleStatus = 'Paused' | 'Running';

export type OverlapPolicy =
  | 'Skip'
  | 'BufferOne'
  | 'BufferAll'
  | 'CancelOther'
  | 'TerminateOther'
  | 'AllowAll';
