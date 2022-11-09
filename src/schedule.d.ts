type DescribeSchedule = import('$types').DescribeScheduleResponse;
type ScheduleSpec = import('$types').ScheduleSpec;

type SchedulePreset = 'existing' | 'interval' | 'week' | 'month' | 'string';

type ScheduleActionParameters = {
  namespace: string;
  name: string;
  workflowType: string;
  workflowId: string;
  taskQueue: string;
}

type ScheduleSpecParameters = {
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  hour: string;
  minute: string;
  second: string;
  phase: string;
  cronString: string;
}

// For UI Only
type SchedulePresetsParameters = {
  preset: SchedulePreset;
  days: string;
  daysOfWeek: string[];
  daysOfMonth: number[];
  months: string[];
};

type ScheduleParameters = ScheduleRequiredParameters & ScheduleSpecParameters & ScheduleUISpecParameters;