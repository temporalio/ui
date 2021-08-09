/// <reference types="@sveltejs/kit" />

type Heroicon = { [key: string]: string }[][];

type WorkflowStatus =
  | 'Running'
  | 'TimedOut'
  | 'Completed'
  | 'Failed'
  | 'Completed'
  | 'ContinuedAsNew'
  | 'Canceled'
  | 'Terminated'
  | null;

type WorkflowType = string | null;

type WorkflowExecutionFilters = {
  type: WorkflowType;
  status: WorkflowStatus;
};
