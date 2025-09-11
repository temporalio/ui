import type { PayloadInputEncoding } from '$lib/components/payload-input-with-encoding.svelte';
import type { SearchAttributeInput } from '$lib/stores/search-attributes';
import type {
  CalendarSpec,
  DescribeScheduleResponse,
  IntervalSpec,
  RangeSpec,
  Schedule,
  ScheduleSpec,
  StructuredCalendarSpec,
} from '$lib/types';

export type DescribeFullSchedule = DescribeScheduleResponse & {
  schedule_id: string;
  schedule?: Schedule;
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
  searchAttributes: SearchAttributeInput[];
  workflowSearchAttributes?: SearchAttributeInput[];
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
  searchAttributes: SearchAttributeInput[];
  workflowSearchAttributes?: SearchAttributeInput[];
  timezoneName: string;
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
