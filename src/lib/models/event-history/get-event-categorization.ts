import { translate } from '$lib/i18n/translate';
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
  label: string;
  value: EventTypeCategory;
};

export const allEventTypeOptions: EventTypeOption[] = [
  {
    label: translate('events.category.activity'),
    value: CATEGORIES.ACTIVITY,
  },
  {
    label: translate('events.category.child-workflow'),
    value: CATEGORIES.CHILD_WORKFLOW,
  },
  {
    label: translate('events.category.command'),
    value: CATEGORIES.COMMAND,
  },
  {
    label: translate('events.category.local-activity'),
    value: CATEGORIES.LOCAL_ACTIVITY,
  },
  {
    label: translate('events.category.marker'),
    value: CATEGORIES.MARKER,
  },
  {
    label: translate('events.category.signal'),
    value: CATEGORIES.SIGNAL,
  },
  {
    label: translate('events.category.timer'),
    value: CATEGORIES.TIMER,
  },
  { label: translate('events.category.update'), value: CATEGORIES.UPDATE },
  {
    label: translate('events.category.workflow'),
    value: CATEGORIES.WORKFLOW,
  },
];

const compactEventTypes: EventTypeCategory[] = [
  CATEGORIES.ACTIVITY,
  CATEGORIES.LOCAL_ACTIVITY,
  CATEGORIES.CHILD_WORKFLOW,
  CATEGORIES.SIGNAL,
  CATEGORIES.TIMER,
  CATEGORIES.MARKER,
  CATEGORIES.UPDATE,
];

export const compactEventTypeOptions: EventTypeOption[] =
  allEventTypeOptions.filter(({ value }) => compactEventTypes.includes(value));

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
