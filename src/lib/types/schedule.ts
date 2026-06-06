import type { temporal } from '@temporalio/proto';

import type {
  CalendarSpec,
  DescribeScheduleResponse,
  Duration,
  IntervalSpec,
  RangeSpec,
  Schedule,
  SchedulePolicies,
  ScheduleSpec,
  ScheduleState,
  SearchAttribute,
  StructuredCalendarSpec,
} from '$lib/types';

export type DescribeFullSchedule = DescribeScheduleResponse & {
  schedule_id: string;
  schedule?: Schedule;
};

type Override<T, U> = Omit<T, keyof U> & U;

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

export type FullSchedule = Schedule;
export type FullScheduleSpec = ScheduleSpec;
export type FullCalendarSpec = CalendarSpec;
export type StructuredCalendars = StructuredCalendarSpec[];
export type StructuredCalendar = StructuredCalendarSpec;
export type ScheduleInterval = IntervalSpec;
export type ScheduleRange = RangeSpec;

export type SchedulePreset =
  | 'existing'
  | 'interval'
  | 'week'
  | 'month'
  | 'string';

export type ScheduleSpecType = 'cron' | 'week' | 'month' | 'interval';

export type ScheduleOffsetUnit = 'days' | 'hrs' | 'min' | 'sec';

export type EndDateType = 'never' | 'on' | 'after';

export type ScheduleStatus = 'Paused' | 'Running';

export type OverlapPolicy =
  | 'Skip'
  | 'BufferOne'
  | 'BufferAll'
  | 'CancelOther'
  | 'TerminateOther'
  | 'AllowAll';
