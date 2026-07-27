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
  LOCAL_ACTIVITY: 'local-activity',
  NEXUS: 'nexus',
  SIGNAL: 'signal',
  TIMER: 'timer',
  UPDATE: 'update',
  WORKFLOW: 'workflow',
  OTHER: 'other',
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

  SignalExternalWorkflowExecutionFailed: CATEGORIES.SIGNAL,
  SignalExternalWorkflowExecutionInitiated: CATEGORIES.SIGNAL,
  WorkflowExecutionSignaled: CATEGORIES.SIGNAL,
  ExternalWorkflowExecutionSignaled: CATEGORIES.SIGNAL,

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
  WorkflowExecutionOptionsUpdated: CATEGORIES.WORKFLOW,
  WorkflowTaskCompleted: CATEGORIES.WORKFLOW,
  WorkflowTaskFailed: CATEGORIES.WORKFLOW,
  WorkflowTaskScheduled: CATEGORIES.WORKFLOW,
  WorkflowTaskStarted: CATEGORIES.WORKFLOW,
  WorkflowTaskTimedOut: CATEGORIES.WORKFLOW,
  ExternalWorkflowExecutionCancelRequested: CATEGORIES.WORKFLOW,
  RequestCancelExternalWorkflowExecutionFailed: CATEGORIES.WORKFLOW,
  RequestCancelExternalWorkflowExecutionInitiated: CATEGORIES.WORKFLOW,

  WorkflowExecutionUpdateAccepted: CATEGORIES.UPDATE,
  WorkflowExecutionUpdateCompleted: CATEGORIES.UPDATE,
  WorkflowExecutionUpdateRequested: CATEGORIES.UPDATE,
  WorkflowExecutionUpdateRejected: CATEGORIES.UPDATE,
  WorkflowExecutionUpdateAdmitted: CATEGORIES.UPDATE,

  NexusOperationScheduled: CATEGORIES.NEXUS,
  NexusOperationStarted: CATEGORIES.NEXUS,
  NexusOperationCompleted: CATEGORIES.NEXUS,
  NexusOperationFailed: CATEGORIES.NEXUS,
  NexusOperationCanceled: CATEGORIES.NEXUS,
  NexusOperationTimedOut: CATEGORIES.NEXUS,
  NexusOperationCancelRequested: CATEGORIES.NEXUS,
  NexusOperationCancelRequestCompleted: CATEGORIES.NEXUS,
  NexusOperationCancelRequestFailed: CATEGORIES.NEXUS,

  MarkerRecorded: CATEGORIES.OTHER,
  UpsertWorkflowSearchAttributes: CATEGORIES.OTHER,
  WorkflowPropertiesModified: CATEGORIES.OTHER,
};

export type EventTypeOption = {
  label: I18nKey;
  value: EventTypeCategory;
  description?: I18nKey;
};

export const allEventTypeOptions: EventTypeOption[] = [
  {
    label: 'events.category.activity',
    value: CATEGORIES.ACTIVITY,
    description: 'events.category.activity-tooltip',
  },
  {
    label: 'events.category.child-workflow',
    value: CATEGORIES.CHILD_WORKFLOW,
    description: 'events.category.child-workflow-tooltip',
  },
  {
    label: 'events.category.local-activity',
    value: CATEGORIES.LOCAL_ACTIVITY,
    description: 'events.category.local-activity-tooltip',
  },
  {
    label: 'events.category.signal',
    value: CATEGORIES.SIGNAL,
    description: 'events.category.signal-tooltip',
  },
  {
    label: 'events.category.timer',
    value: CATEGORIES.TIMER,
    description: 'events.category.timer-tooltip',
  },
  {
    label: 'events.category.update',
    value: CATEGORIES.UPDATE,
    description: 'events.category.update-tooltip',
  },
  {
    label: 'events.category.nexus',
    value: CATEGORIES.NEXUS,
    description: 'events.category.nexus-tooltip',
  },
  {
    label: 'events.category.workflow',
    value: CATEGORIES.WORKFLOW,
    description: 'events.category.workflow-tooltip',
  },
  {
    label: 'events.category.other',
    value: CATEGORIES.OTHER,
    description: 'events.category.other-tooltip',
  },
];

const compactEventTypes: EventTypeCategory[] = [
  CATEGORIES.ACTIVITY,
  CATEGORIES.LOCAL_ACTIVITY,
  CATEGORIES.CHILD_WORKFLOW,
  CATEGORIES.SIGNAL,
  CATEGORIES.TIMER,
  CATEGORIES.UPDATE,
  CATEGORIES.NEXUS,
  CATEGORIES.OTHER,
];

export const compactEventTypeOptions: EventTypeOption[] =
  allEventTypeOptions.filter(({ value }) => compactEventTypes.includes(value));

export const getEventCategory = (eventType: EventType): EventTypeCategory => {
  return eventTypeCategorizations?.[eventType] || CATEGORIES.OTHER;
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
