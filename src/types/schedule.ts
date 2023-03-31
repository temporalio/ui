import type { DescribeScheduleResponse, Schedule } from '$types';

export type DescribeSchedule = import('$types').DescribeScheduleResponse;
export type CalendarSpec = import('$types').CalendarSpec;

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

export type StartEndInterval = {
  start?: number;
  end?: number;
  step?: number;
};

export type StructuredCalendar = {
  second?: StartEndInterval[];
  minute?: StartEndInterval[];
  hour?: StartEndInterval[];
  dayOfMonth?: StartEndInterval[];
  dayOfWeek?: StartEndInterval[];
  month?: StartEndInterval[];
  year?: StartEndInterval[];
  comment?: string;
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
