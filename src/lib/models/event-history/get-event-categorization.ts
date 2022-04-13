export const eventTypeCategorizations: Readonly<
  Record<EventType, EventTypeCategory>
> = {
  ActivityTaskCanceled: 'activity',
  ActivityTaskCancelRequested: 'activity',
  ActivityTaskCompleted: 'activity',
  ActivityTaskFailed: 'activity',
  ActivityTaskScheduled: 'activity',
  ActivityTaskStarted: 'activity',
  ActivityTaskTimedOut: 'activity',

  ChildWorkflowExecutionCanceled: 'child-workflow',
  ChildWorkflowExecutionCompleted: 'child-workflow',
  ChildWorkflowExecutionFailed: 'child-workflow',
  ChildWorkflowExecutionStarted: 'child-workflow',
  ChildWorkflowExecutionTerminated: 'child-workflow',
  ChildWorkflowExecutionTimedOut: 'child-workflow',
  StartChildWorkflowExecutionFailed: 'child-workflow',
  StartChildWorkflowExecutionInitiated: 'child-workflow',

  SignalExternalWorkflowExecutionFailed: 'signal',
  SignalExternalWorkflowExecutionInitiated: 'signal',
  WorkflowExecutionSignaled: 'signal',

  TimerCanceled: 'timer',
  TimerFired: 'timer',
  TimerStarted: 'timer',

  WorkflowExecutionCanceled: 'workflow',
  WorkflowExecutionCancelRequested: 'workflow',
  WorkflowExecutionCompleted: 'workflow',
  WorkflowExecutionContinuedAsNew: 'workflow',
  WorkflowExecutionFailed: 'workflow',
  WorkflowExecutionStarted: 'workflow',
  WorkflowExecutionTerminated: 'workflow',
  WorkflowExecutionTimedOut: 'workflow',
  WorkflowTaskCompleted: 'workflow',
  WorkflowTaskFailed: 'workflow',
  WorkflowTaskScheduled: 'workflow',
  WorkflowTaskStarted: 'workflow',
  WorkflowTaskTimedOut: 'workflow',
  ExternalWorkflowExecutionCancelRequested: 'workflow',
  ExternalWorkflowExecutionSignaled: 'workflow',
  RequestCancelExternalWorkflowExecutionFailed: 'workflow',
  RequestCancelExternalWorkflowExecutionInitiated: 'workflow',

  MarkerRecorded: 'command',
  UpsertWorkflowSearchAttributes: 'command',
};

export type EventTypeCategory = typeof categories[number];
const categories = [
  'activity',
  'child-workflow',
  'signal',
  'timer',
  'workflow',
  'command',
] as const;

type EventTypeOption = {
  label: string;
  option: EventTypeCategory | undefined;
};

export const allEventTypeOptions: EventTypeOption[] = [
  { label: 'All', option: undefined },
  { label: 'Activity', option: 'activity' },
  { label: 'Child Workflow', option: 'child-workflow' },
  { label: 'Command', option: 'command' },
  { label: 'Signal', option: 'signal' },
  { label: 'Timer', option: 'timer' },
  { label: 'Workflow', option: 'workflow' },
];

export const compactEventTypeOptions: EventTypeOption[] = [
  { label: 'All', option: undefined },
  { label: 'Activity', option: 'activity' },
  { label: 'Signal', option: 'signal' },
  { label: 'Timer', option: 'timer' },
];

export const getEventCategory = (eventType: EventType): EventTypeCategory => {
  return eventTypeCategorizations[eventType];
};

export const isCategoryType = (value: string): value is EventTypeCategory => {
  for (const category of categories) {
    if (value === category) return true;
  }
  return false;
};

export const getEventsInCategory = (
  events: HistoryEventWithId[],
  category: string,
): HistoryEventWithId[] => {
  if (!isCategoryType(category)) return events;
  return events.filter((event: IterableEvent) => event.category === category);
};
