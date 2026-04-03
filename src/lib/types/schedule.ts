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

export type ScheduleStatus = 'Paused' | 'Running';

export type OverlapPolicy =
  | 'Unspecified'
  | 'Skip'
  | 'BufferOne'
  | 'BufferAll'
  | 'CancelOther'
  | 'TerminateOther'
  | 'AllowAll';
