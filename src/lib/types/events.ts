import type { Timestamp } from '@temporalio/common';
import type { google } from '@temporalio/proto';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { ActivityOptions, EventLink } from '$lib/types';

import type { Replace, Settings } from './global';

export type EventHistory = Replace<
  import('$lib/types').History,
  { events: HistoryEvent[] }
>;

export type HistoryEvent = Replace<
  import('$lib/types').HistoryEvent,
  { eventType: EventType; eventId: string; links?: EventLink[] }
>;

export type GetWorkflowExecutionHistoryResponse = Replace<
  import('$lib/types').GetWorkflowExecutionHistoryResponse,
  { history: EventHistory }
>;

export type PendingActivityInfo = Replace<
  import('$lib/types').PendingActivityInfo,
  { activityId: string }
>;

export type Payload = {
  metadata?: { [k: string]: string };
  data?: string;
};

export type PauseInfo = {
  manual: {
    reason: string;
    identity: string;
  };
  pauseTime: Timestamp;
};

export type PendingActivity = Replace<
  PendingActivityInfo,
  {
    id: string;
    state: PendingActivityState;
    activityType?: string;
    pauseInfo?: PauseInfo;
    activityOptions?: ActivityOptions;
  }
>;

export type PendingActivityState =
  | 'Unspecified'
  | 'Scheduled'
  | 'Started'
  | 'CancelRequested';

export type PendingChildren = import('$lib/types').PendingChildrenInfo;
export type PendingNexusOperation = import('$lib/types').PendingNexusInfo & {
  scheduleToStartTimeout: google.protobuf.IDuration | null;
  startToCloseTimeout: google.protobuf.IDuration | null;
};
export type Callbacks = import('$lib/types').CallbackInfo[];

export type EventRequestMetadata = {
  namespace: string;
  settings: Settings;
  accessToken: string;
};

export type EventWithMetadata = {
  historyEvent: HistoryEvent;
} & EventRequestMetadata;

export type EventType = import('$lib/utilities/is-event-type').EventType;
export type ResetEventType =
  import('$lib/utilities/is-event-type').ResetEventType;

export type EventTypeCategory =
  import('$lib/models/event-history/get-event-categorization').EventTypeCategory;

export type EventClassification =
  import('$lib/models/event-history/get-event-classification').EventClassification;

export interface WorkflowEvent extends HistoryEvent {
  id: string;
  attributes: EventAttribute;
  timestamp: string;
  classification: EventClassification;
  category: EventTypeCategory;
  name: EventType;
  links?: EventLink[];
  billableActions?: number;
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
  | 'name'
  | 'links';

export type CommonHistoryEvent = Pick<WorkflowEvent, CommonEventKey>;

export type EventAttributeKey = keyof Omit<HistoryEvent, CommonEventKey>;
export type EventAttribute = HistoryEvent[EventAttributeKey];
export type EventAttributesWithType<K extends keyof HistoryEvent> =
  HistoryEvent[K] & {
    type: K;
  };

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

export type EventView = 'compact' | 'feed' | 'json';
export type TaskQueueView = 'workers' | 'versioning';

export type IterableEvent = WorkflowEvent | EventGroup;

export type WorkflowEventWithPending =
  | WorkflowEvent
  | PendingActivity
  | PendingNexusOperation;

export type IterableEventWithPending = EventGroup | WorkflowEventWithPending;

export type WorkflowExecutionStartedEvent =
  EventWithAttributes<'workflowExecutionStartedEventAttributes'>;
export type WorkflowExecutionCompletedEvent =
  EventWithAttributes<'workflowExecutionCompletedEventAttributes'>;
export type WorkflowExecutionOptionsUpdatedEvent =
  EventWithAttributes<'workflowExecutionOptionsUpdatedEventAttributes'>;
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
export type WorkflowExecutionUpdateAdmittedEvent =
  EventWithAttributes<'workflowExecutionUpdateAdmittedEventAttributes'>;
export type WorkflowExecutionUpdateAcceptedEvent =
  EventWithAttributes<'workflowExecutionUpdateAcceptedEventAttributes'>;
export type WorkflowExecutionUpdateRejectedEvent =
  EventWithAttributes<'workflowExecutionUpdateRejectedEventAttributes'>;
export type WorkflowExecutionUpdateCompletedEvent =
  EventWithAttributes<'workflowExecutionUpdateCompletedEventAttributes'>;
export type NexusOperationScheduledEvent =
  EventWithAttributes<'nexusOperationScheduledEventAttributes'>;
export type NexusOperationStartedEvent =
  EventWithAttributes<'nexusOperationStartedEventAttributes'>;
export type NexusOperationCompletedEvent =
  EventWithAttributes<'nexusOperationCompletedEventAttributes'>;
export type NexusOperationFailedEvent =
  EventWithAttributes<'nexusOperationFailedEventAttributes'>;
export type NexusOperationCanceledEvent =
  EventWithAttributes<'nexusOperationCanceledEventAttributes'>;
export type NexusOperationTimedOutEvent =
  EventWithAttributes<'nexusOperationTimedOutEventAttributes'>;
export type NexusOperationCancelRequestedEvent =
  EventWithAttributes<'nexusOperationCancelRequestedEventAttributes'>;
export type WorkflowPropertiesModifiedEvent =
  EventWithAttributes<'workflowPropertiesModifiedEventAttributes'>;
