import type { Replace, Settings } from './global';

export type EventHistory = Replace<
  import('$types').History,
  { events: HistoryEvent[] }
>;

export type HistoryEvent = Replace<
  import('$types').HistoryEvent,
  { eventType: EventType }
>;

export type GetWorkflowExecutionHistoryResponse = Replace<
  import('$types').GetWorkflowExecutionHistoryResponse,
  { history: EventHistory }
>;

export type PendingActivityInfo = Replace<
  import('$types').PendingActivityInfo,
  { activityId: string }
>;

export type PendingActivityState =
  | 'Unspecified'
  | 'Scheduled'
  | 'Started'
  | 'CancelRequested';

export type PendingChildren = import('$types').PendingChildrenInfo;

export type EventRequestMetadata = {
  namespace: string;
  settings: Settings;
  accessToken: string;
};

export type EventWithMetadata = {
  historyEvent: HistoryEvent;
} & EventRequestMetadata;

export type EventsWithMetadata = {
  response: HistoryEvent[];
} & EventRequestMetadata;

export type EventType = import('$lib/utilities/is-event-type').EventType;

export type ActivityType = import('$lib/utilities/is-event-type').ActivityType;
export type TimerType = import('$lib/utilities/is-event-type').TimerType;
export type SignalType = import('$lib/utilities/is-event-type').SignalType;
export type MarkerType = import('$lib/utilities/is-event-type').MarkerType;

export type EventTypeCategory =
  import('$lib/models/event-history/get-event-categorization').EventTypeCategory;

export interface WorkflowEvent extends HistoryEvent {
  id: string;
  attributes: EventAttribute;
  timestamp: string;
  classification: EventClassification;
  category: EventTypeCategory;
  name: EventType;
}

export type WorkflowEvents = WorkflowEvent[];

export type PendingActivityWithMetadata = {
  activity: PendingActivity;
} & EventRequestMetadata;

export type CommonEventKey =
  | 'id'
  | 'eventType'
  | 'attributes'
  | 'eventId'
  | 'eventTime'
  | 'version'
  | 'taskId'
  | 'timestamp'
  | 'classification'
  | 'category'
  | 'workerMayIgnore'
  | 'name';

export type CommonHistoryEvent = Pick<WorkflowEvent, CommonEventKey>;

export type EventAttributeKey = keyof Omit<HistoryEvent, CommonEventKey>;
export type EventAttribute = HistoryEvent[EventAttributeKey];

export type EventWithAttributes<A extends EventAttributeKey> =
  CommonHistoryEvent &
    Pick<WorkflowEvent, A> & { attributes: EventAttributesWithType<A> };

export type ActivityEvent = ActivityTaskScheduledEvent &
  ActivityTaskStartedEvent &
  ActivityTaskCompletedEvent &
  ActivityTaskFailedEvent &
  ActivityTaskTimedOutEvent &
  ActivityTaskCancelRequestedEvent &
  ActivityTaskCanceledEvent;

export type TimerEvent = TimerCanceledEvent &
  TimerStartedEvent &
  TimerFiredEvent;

export type SignalEvent = SignalExternalWorkflowExecutionInitiatedEvent &
  SignalExternalWorkflowExecutionFailedEvent &
  WorkflowExecutionSignaledEvent;

export type MarkerEvent = MarkerRecordedEvent;

export type ChildEvent = StartChildWorkflowExecutionInitiatedEvent &
  StartChildWorkflowExecutionFailedEvent &
  ChildWorkflowExecutionStartedEvent &
  ChildWorkflowExecutionCompletedEvent &
  ChildWorkflowExecutionFailedEvent &
  ChildWorkflowExecutionCanceledEvent &
  ChildWorkflowExecutionTimedOutEvent &
  ChildWorkflowExecutionTerminatedEvent;

export type EventView = 'feed' | 'compact' | 'json';

export type FetchEventsResponse = {
  events: WorkflowEvents;
  eventGroups: EventGroups;
};

export type IterableEvent = WorkflowEvent | EventGroup;
export type IterableEvents = IterableEvent[];

export type WorkflowExecutionStartedEvent =
  EventWithAttributes<'workflowExecutionStartedEventAttributes'>;
export type WorkflowExecutionCompletedEvent =
  EventWithAttributes<'workflowExecutionCompletedEventAttributes'>;
export type WorkflowExecutionFailedEvent =
  EventWithAttributes<'workflowExecutionFailedEventAttributes'>;
export type WorkflowExecutionTimedOutEvent =
  EventWithAttributes<'workflowExecutionTimedOutEventAttributes'>;
export type WorkflowTaskScheduledEvent =
  EventWithAttributes<'workflowTaskScheduledEventAttributes'>;
export type WorkflowTaskStartedEvent =
  EventWithAttributes<'workflowTaskStartedEventAttributes'>;
export type WorkflowTaskCompletedEvent =
  EventWithAttributes<'workflowTaskCompletedEventAttributes'>;
export type WorkflowTaskTimedOutEvent =
  EventWithAttributes<'workflowTaskTimedOutEventAttributes'>;
export type WorkflowTaskFailedEvent =
  EventWithAttributes<'workflowTaskFailedEventAttributes'>;
export type ActivityTaskScheduledEvent =
  EventWithAttributes<'activityTaskScheduledEventAttributes'>;
export type ActivityTaskStartedEvent =
  EventWithAttributes<'activityTaskStartedEventAttributes'>;
export type ActivityTaskCompletedEvent =
  EventWithAttributes<'activityTaskCompletedEventAttributes'>;
export type ActivityTaskFailedEvent =
  EventWithAttributes<'activityTaskFailedEventAttributes'>;
export type ActivityTaskTimedOutEvent =
  EventWithAttributes<'activityTaskTimedOutEventAttributes'>;
export type TimerStartedEvent =
  EventWithAttributes<'timerStartedEventAttributes'>;
export type TimerFiredEvent = EventWithAttributes<'timerFiredEventAttributes'>;
export type ActivityTaskCancelRequestedEvent =
  EventWithAttributes<'activityTaskCancelRequestedEventAttributes'>;
export type ActivityTaskCanceledEvent =
  EventWithAttributes<'activityTaskCanceledEventAttributes'>;
export type TimerCanceledEvent =
  EventWithAttributes<'timerCanceledEventAttributes'>;
export type MarkerRecordedEvent =
  EventWithAttributes<'markerRecordedEventAttributes'>;
export type WorkflowExecutionSignaledEvent =
  EventWithAttributes<'workflowExecutionSignaledEventAttributes'>;
export type WorkflowExecutionTerminatedEvent =
  EventWithAttributes<'workflowExecutionTerminatedEventAttributes'>;
export type WorkflowExecutionCancelRequestedEvent =
  EventWithAttributes<'workflowExecutionCancelRequestedEventAttributes'>;
export type WorkflowExecutionCanceledEvent =
  EventWithAttributes<'workflowExecutionCanceledEventAttributes'>;
export type RequestCancelExternalWorkflowExecutionInitiatedEvent =
  EventWithAttributes<'requestCancelExternalWorkflowExecutionInitiatedEventAttributes'>;
export type RequestCancelExternalWorkflowExecutionFailedEvent =
  EventWithAttributes<'requestCancelExternalWorkflowExecutionFailedEventAttributes'>;
export type ExternalWorkflowExecutionCancelRequestedEvent =
  EventWithAttributes<'externalWorkflowExecutionCancelRequestedEventAttributes'>;
export type WorkflowExecutionContinuedAsNewEvent =
  EventWithAttributes<'workflowExecutionContinuedAsNewEventAttributes'>;
export type StartChildWorkflowExecutionInitiatedEvent =
  EventWithAttributes<'startChildWorkflowExecutionInitiatedEventAttributes'>;
export type StartChildWorkflowExecutionFailedEvent =
  EventWithAttributes<'startChildWorkflowExecutionFailedEventAttributes'>;
export type ChildWorkflowExecutionStartedEvent =
  EventWithAttributes<'childWorkflowExecutionStartedEventAttributes'>;
export type ChildWorkflowExecutionCompletedEvent =
  EventWithAttributes<'childWorkflowExecutionCompletedEventAttributes'>;
export type ChildWorkflowExecutionFailedEvent =
  EventWithAttributes<'childWorkflowExecutionFailedEventAttributes'>;
export type ChildWorkflowExecutionCanceledEvent =
  EventWithAttributes<'childWorkflowExecutionCanceledEventAttributes'>;
export type ChildWorkflowExecutionTimedOutEvent =
  EventWithAttributes<'childWorkflowExecutionTimedOutEventAttributes'>;
export type ChildWorkflowExecutionTerminatedEvent =
  EventWithAttributes<'childWorkflowExecutionTerminatedEventAttributes'>;
export type SignalExternalWorkflowExecutionInitiatedEvent =
  EventWithAttributes<'signalExternalWorkflowExecutionInitiatedEventAttributes'>;
export type SignalExternalWorkflowExecutionFailedEvent =
  EventWithAttributes<'signalExternalWorkflowExecutionFailedEventAttributes'>;
export type ExternalWorkflowExecutionSignaledEvent =
  EventWithAttributes<'externalWorkflowExecutionSignaledEventAttributes'>;
export type UpsertWorkflowSearchAttributesEvent =
  EventWithAttributes<'upsertWorkflowSearchAttributesEventAttributes'>;
