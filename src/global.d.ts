/// <reference types="@sveltejs/kit" />

interface Window {
  Prism: {
    highlightAll: () => void;
  };
}

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

type EventFormat = 'grid' | 'json';

type Activity = {
  activityTaskStartedEvent?: ActivityTaskStartedEvent;
  activityTaskScheduledEvent?: ActivityTaskScheduledEvent;
  activityTaskCompletedEvent?: ActivityTaskCompletedEvent;
  activityTaskFailedEvent?: ActivityTaskFailedEvent;
  activityTaskTimedOutEvent?: ActivityTaskTimedOutEvent;
  activityTaskCancelRequestedEvent?: ActivityTaskCancelRequestedEvent;
  activityTaskCanceledEvent?: ActivityTaskCanceledEvent;
};
