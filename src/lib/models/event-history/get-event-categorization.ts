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
  events: HistoryEventWithId[] | CompactEventGroups,
  category: string,
) => {
  if (!isCategoryType(category)) return events;
  return events.filter(
    (event: HistoryEventWithId | CompactEventGroup) =>
      event.category === category,
  );
};
