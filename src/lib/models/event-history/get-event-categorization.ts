import type { I18nKey } from '$lib/i18n';
import type {
  EventType,
  IterableEvent,
  WorkflowEvents,
} from '$lib/types/events';

type Categories = typeof CATEGORIES;
export type EventTypeCategory = Categories[keyof Categories];

export const CATEGORIES = {
  ACTIVITY: 'activity',
  CHILD_WORKFLOW: 'child-workflow',
  COMMAND: 'command',
  LOCAL_ACTIVITY: 'local-activity',
  MARKER: 'marker',
  SIGNAL: 'signal',
  TIMER: 'timer',
  UPDATE: 'update',
  WORKFLOW: 'workflow',
} as const;

export const eventTypeCategorizations: Readonly<
  Record<EventType, EventTypeCategory>
> = {
  ActivityTaskCanceled: CATEGORIES.ACTIVITY,
  ActivityTaskCancelRequested: CATEGORIES.ACTIVITY,
  ActivityTaskCompleted: CATEGORIES.ACTIVITY,
  ActivityTaskFailed: CATEGORIES.ACTIVITY,
  ActivityTaskScheduled: CATEGORIES.ACTIVITY,
  ActivityTaskStarted: CATEGORIES.ACTIVITY,
  ActivityTaskTimedOut: CATEGORIES.ACTIVITY,

  ChildWorkflowExecutionCanceled: CATEGORIES.CHILD_WORKFLOW,
  ChildWorkflowExecutionCompleted: CATEGORIES.CHILD_WORKFLOW,
  ChildWorkflowExecutionFailed: CATEGORIES.CHILD_WORKFLOW,
  ChildWorkflowExecutionStarted: CATEGORIES.CHILD_WORKFLOW,
  ChildWorkflowExecutionTerminated: CATEGORIES.CHILD_WORKFLOW,
  ChildWorkflowExecutionTimedOut: CATEGORIES.CHILD_WORKFLOW,
  StartChildWorkflowExecutionFailed: CATEGORIES.CHILD_WORKFLOW,
  StartChildWorkflowExecutionInitiated: CATEGORIES.CHILD_WORKFLOW,

  MarkerRecorded: CATEGORIES.MARKER,

  SignalExternalWorkflowExecutionFailed: CATEGORIES.SIGNAL,
  SignalExternalWorkflowExecutionInitiated: CATEGORIES.SIGNAL,
  WorkflowExecutionSignaled: CATEGORIES.SIGNAL,

  TimerCanceled: CATEGORIES.TIMER,
  TimerFired: CATEGORIES.TIMER,
  TimerStarted: CATEGORIES.TIMER,

  WorkflowExecutionCanceled: CATEGORIES.WORKFLOW,
  WorkflowExecutionCancelRequested: CATEGORIES.WORKFLOW,
  WorkflowExecutionCompleted: CATEGORIES.WORKFLOW,
  WorkflowExecutionContinuedAsNew: CATEGORIES.WORKFLOW,
  WorkflowExecutionFailed: CATEGORIES.WORKFLOW,
  WorkflowExecutionStarted: CATEGORIES.WORKFLOW,
  WorkflowExecutionTerminated: CATEGORIES.WORKFLOW,
  WorkflowExecutionTimedOut: CATEGORIES.WORKFLOW,
  WorkflowTaskCompleted: CATEGORIES.WORKFLOW,
  WorkflowTaskFailed: CATEGORIES.WORKFLOW,
  WorkflowTaskScheduled: CATEGORIES.WORKFLOW,
  WorkflowTaskStarted: CATEGORIES.WORKFLOW,
  WorkflowTaskTimedOut: CATEGORIES.WORKFLOW,
  ExternalWorkflowExecutionCancelRequested: CATEGORIES.WORKFLOW,
  ExternalWorkflowExecutionSignaled: CATEGORIES.WORKFLOW,
  RequestCancelExternalWorkflowExecutionFailed: CATEGORIES.WORKFLOW,
  RequestCancelExternalWorkflowExecutionInitiated: CATEGORIES.WORKFLOW,

  UpsertWorkflowSearchAttributes: CATEGORIES.COMMAND,

  WorkflowExecutionUpdateAccepted: CATEGORIES.UPDATE,
  WorkflowExecutionUpdateCompleted: CATEGORIES.UPDATE,
};

export type EventTypeOption = {
  label: I18nKey<'events'>;
  option: EventTypeCategory | undefined;
  color?: string;
};

export const allEventTypeOptions: EventTypeOption[] = [
  { label: 'category-all', option: undefined },
  {
    label: 'category-activity',
    option: CATEGORIES.ACTIVITY,
    color: '#8B5CF6',
  },
  {
    label: 'category-child-workflow',
    option: CATEGORIES.CHILD_WORKFLOW,
    color: '#F59E0B',
  },
  {
    label: 'category-command',
    option: CATEGORIES.COMMAND,
    color: '#10B981',
  },
  {
    label: 'category-local-activity',
    option: CATEGORIES.LOCAL_ACTIVITY,
  },
  {
    label: 'category-marker',
    option: CATEGORIES.MARKER,
    color: '#EC4899',
  },
  {
    label: 'category-signal',
    option: CATEGORIES.SIGNAL,
    color: '#DD6B20',
  },
  {
    label: 'category-timer',
    option: CATEGORIES.TIMER,
    color: '#1D4ED8',
  },
  { label: 'category-update', option: CATEGORIES.UPDATE },
  {
    label: 'category-workflow',
    option: CATEGORIES.WORKFLOW,
    color: '#10B981',
  },
];

const compactEventTypes: (EventTypeCategory | undefined)[] = [
  undefined,
  CATEGORIES.ACTIVITY,
  CATEGORIES.LOCAL_ACTIVITY,
  CATEGORIES.SIGNAL,
  CATEGORIES.TIMER,
];
export const compactEventTypeOptions: EventTypeOption[] =
  allEventTypeOptions.filter(({ option }) =>
    compactEventTypes.includes(option),
  );

const timelineEventTypes: EventTypeCategory[] = [
  CATEGORIES.ACTIVITY,
  CATEGORIES.LOCAL_ACTIVITY,
  CATEGORIES.CHILD_WORKFLOW,
  CATEGORIES.COMMAND,
  CATEGORIES.MARKER,
  CATEGORIES.SIGNAL,
  CATEGORIES.TIMER,
  CATEGORIES.UPDATE,
];
export const timelineEventTypeOptions: EventTypeOption[] =
  allEventTypeOptions.filter(({ option }) =>
    timelineEventTypes.includes(option),
  );

export const getEventCategory = (eventType: EventType): EventTypeCategory => {
  return eventTypeCategorizations[eventType];
};

export const isCategoryType = (value: string): value is EventTypeCategory => {
  for (const category in CATEGORIES) {
    if (value === CATEGORIES[category]) return true;
  }
  return false;
};

export const getEventsInCategory = (
  events: WorkflowEvents,
  category: string,
): WorkflowEvents => {
  if (!isCategoryType(category)) return events;
  return events.filter((event: IterableEvent) => event.category === category);
};
