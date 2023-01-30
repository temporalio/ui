type DescribeSchedule = import('$types').DescribeScheduleResponse;
type CalendarSpec = import('types').ICalendarSpec;

type DescribeFullSchedule = DescribeScheduleResponse & {
  schedule_id: string;
  schedule?: FullScheduleSpec;
};

type FullScheduleSpec = Schedule & {
  calendar: FullCalendarSpec;
};

type FullCalendarSpec = CalendarSpec & {
  cronString?: string[];
  structuredCalendar?: any[];
};

type StartEndInterval = {
  start?: number;
  end?: number;
  step?: number;
};

type StructuredCalendar = {
  second?: StartEndInterval[];
  minute?: StartEndInterval[];
  hour?: StartEndInterval[];
  dayOfMonth?: StartEndInterval[];
  dayOfWeek?: StartEndInterval[];
  month?: StartEndInterval[];
  year?: StartEndInterval[];
  comment?: string;
};

type SchedulePreset = 'existing' | 'interval' | 'week' | 'month' | 'string';

type ScheduleOffsetUnit = 'days' | 'hrs' | 'min' | 'sec';

type ScheduleActionParameters = {
  namespace: string;
  name: string;
  workflowType: string;
  workflowId: string;
  taskQueue: string;
};

type ScheduleSpecParameters = {
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
type SchedulePresetsParameters = {
  preset: SchedulePreset;
  days: string;
  daysOfWeek: string[];
  daysOfMonth: number[];
  months: string[];
};

type ScheduleParameters = ScheduleRequiredParameters &
  ScheduleSpecParameters &
  ScheduleUISpecParameters;
