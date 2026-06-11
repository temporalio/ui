import type { temporal } from '@temporalio/proto';

import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
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
  schedule?: Schedule;
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

export type ScheduleOffsetUnit = 'days' | 'hrs' | 'min' | 'sec';

export type ScheduleActionParameters = {
  identity?: string;
  namespace: string;
  name: string;
  workflowType: string;
  workflowId: string;
  taskQueue: string;
  input: string;
  encoding: PayloadInputEncoding;
  messageType?: string;
  searchAttributes: SearchAttributesSchema;
  workflowSearchAttributes?: SearchAttributesSchema;
};

export type ScheduleSpecParameters = {
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  hour: string;
  minute: string;
  second: string;
  phase: string;
  cronString: string;
  searchAttributes: SearchAttributesSchema;
  workflowSearchAttributes?: SearchAttributesSchema;
};

// For UI Only
export type SchedulePresetsParameters = {
  preset: SchedulePreset;
  days: string;
  daysOfWeek: string[];
  daysOfMonth: number[];
  months: string[];
};

export type ScheduleParameters = ScheduleActionParameters &
  ScheduleSpecParameters &
  SchedulePresetsParameters;

export type ScheduleStatus = 'Paused' | 'Running';

export type OverlapPolicy =
  | 'Unspecified'
  | 'Skip'
  | 'BufferOne'
  | 'BufferAll'
  | 'CancelOther'
  | 'TerminateOther'
  | 'AllowAll';
