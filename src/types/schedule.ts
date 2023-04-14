import type {
  CalendarSpec,
  DescribeScheduleResponse,
  Schedule,
  StructuredCalendarSpec,
} from '$types';

export type DescribeFullSchedule = DescribeScheduleResponse & {
  schedule_id: string;
  schedule?: FullScheduleSpec;
};

export type FullScheduleSpec = Schedule & {
  calendar: FullCalendarSpec;
};

export type FullCalendarSpec = CalendarSpec & {
  cronString?: string[];
  structuredCalendar?: StructuredCalendarSpec[];
};

export type SchedulePreset =
  | 'existing'
  | 'interval'
  | 'week'
  | 'month'
  | 'string';

export type ScheduleOffsetUnit = 'days' | 'hrs' | 'min' | 'sec';

export type ScheduleActionParameters = {
  namespace: string;
  name: string;
  workflowType: string;
  workflowId: string;
  taskQueue: string;
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
