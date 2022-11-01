// type WorkflowExecutionStatus = import('$types').WorkflowExecutionStatus;
type DescribeSchedule = import('$types').DescribeScheduleResponse;
type ScheduleSpec = import('$types').ScheduleSpec;

type SchedulePreset = 'interval' | 'week' | 'month' | 'string';

type ScheduleParameters = {
  namespace: string;
  preset: SchedulePreset;
  name: string;
  workflowType: string;
  workflowId: string;
  taskQueue: string;
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  hour: string;
  minute: string;
  second: string;
  phase: string;
  cronString: string;

  // For UI
  days: string;
  daysOfWeek: string[];
  daysOfMonth: number[];
  months: string[];
};
