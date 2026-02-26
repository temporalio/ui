import type {
  ActivityTaskCanceledEvent,
  ActivityTaskCancelRequestedEvent,
  ActivityTaskCompletedEvent,
  ActivityTaskFailedEvent,
  ActivityTaskScheduledEvent,
  ActivityTaskStartedEvent,
  ActivityTaskTimedOutEvent,
  ChildWorkflowExecutionCanceledEvent,
  ChildWorkflowExecutionCompletedEvent,
  ChildWorkflowExecutionFailedEvent,
  ChildWorkflowExecutionStartedEvent,
  ChildWorkflowExecutionTerminatedEvent,
  ChildWorkflowExecutionTimedOutEvent,
  CommonHistoryEvent,
  EventAttribute,
  EventAttributeKey,
  EventWithAttributes,
  ExternalWorkflowExecutionCancelRequestedEvent,
  ExternalWorkflowExecutionSignaledEvent,
  HistoryEvent,
  IterableEvent,
  MarkerRecordedEvent,
  NexusOperationCanceledEvent,
  NexusOperationCancelRequestedEvent,
  NexusOperationCompletedEvent,
  NexusOperationFailedEvent,
  NexusOperationScheduledEvent,
  NexusOperationStartedEvent,
  NexusOperationTimedOutEvent,
  RequestCancelExternalWorkflowExecutionFailedEvent,
  RequestCancelExternalWorkflowExecutionInitiatedEvent,
  SignalExternalWorkflowExecutionFailedEvent,
  SignalExternalWorkflowExecutionInitiatedEvent,
  StartChildWorkflowExecutionFailedEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  TimerCanceledEvent,
  TimerFiredEvent,
  TimerStartedEvent,
  UpsertWorkflowSearchAttributesEvent,
  WorkflowEvent,
  WorkflowExecutionCanceledEvent,
  WorkflowExecutionCancelRequestedEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionContinuedAsNewEvent,
  WorkflowExecutionFailedEvent,
  WorkflowExecutionOptionsUpdatedEvent,
  WorkflowExecutionSignaledEvent,
  WorkflowExecutionStartedEvent,
  WorkflowExecutionTerminatedEvent,
  WorkflowExecutionTimedOutEvent,
  WorkflowExecutionUpdateAcceptedEvent,
  WorkflowExecutionUpdateAdmittedEvent,
  WorkflowExecutionUpdateCompletedEvent,
  WorkflowExecutionUpdateRejectedEvent,
  WorkflowTaskCompletedEvent,
  WorkflowTaskFailedEvent,
  WorkflowTaskScheduledEvent,
  WorkflowTaskStartedEvent,
  WorkflowTaskTimedOutEvent,
} from '$lib/types/events';

export type ActivityType = (typeof activityEvents)[number];
export const activityEvents = [
  'ActivityTaskCanceled',
  'ActivityTaskCancelRequested',
  'ActivityTaskCompleted',
  'ActivityTaskFailed',
  'ActivityTaskScheduled',
  'ActivityTaskStarted',
  'ActivityTaskTimedOut',
] as const;

export type TimerType = (typeof timerEvents)[number];
export const timerEvents = [
  'TimerStarted',
  'TimerCanceled',
  'TimerFired',
] as const;

export type SignalType = (typeof signalEvents)[number];
export const signalEvents = [
  'WorkflowExecutionSignaled',
  'SignalExternalWorkflowExecutionFailed',
  'SignalExternalWorkflowExecutionInitiated',
] as const;

export type MarkerType = (typeof markerEvents)[number];
export const markerEvents = ['MarkerRecorded'] as const;

const childEvents = [
  'StartChildWorkflowExecutionInitiated',
  'ChildWorkflowExecutionStarted',
  'ChildWorkflowExecutionCompleted',
  'ChildWorkflowExecutionCanceled',
  'ChildWorkflowExecutionFailed',
  'ChildWorkflowExecutionTerminated',
  'ChildWorkflowExecutionTimedOut',
  'StartChildWorkflowExecutionFailed',
] as const;

const nexusEvents = [
  'NexusOperationScheduled',
  'NexusOperationStarted',
  'NexusOperationCompleted',
  'NexusOperationFailed',
  'NexusOperationCanceled',
  'NexusOperationTimedOut',
  'NexusOperationCancelRequested',
  'NexusOperationCancelRequestCompleted',
  'NexusOperationCancelRequestFailed',
] as const;

export type EventType = (typeof eventTypes)[number];
export const eventTypes = [
  ...activityEvents,
  ...timerEvents,
  ...signalEvents,
  ...markerEvents,
  ...childEvents,
  ...nexusEvents,
  'WorkflowExecutionCanceled',
  'WorkflowExecutionCancelRequested',
  'WorkflowExecutionCompleted',
  'WorkflowExecutionContinuedAsNew',
  'WorkflowExecutionFailed',
  'WorkflowExecutionStarted',
  'WorkflowExecutionTerminated',
  'WorkflowExecutionTimedOut',
  'WorkflowExecutionOptionsUpdated',
  'WorkflowTaskCompleted',
  'WorkflowTaskFailed',
  'WorkflowTaskScheduled',
  'WorkflowTaskStarted',
  'WorkflowTaskTimedOut',
  'ExternalWorkflowExecutionCancelRequested',
  'ExternalWorkflowExecutionSignaled',
  'RequestCancelExternalWorkflowExecutionFailed',
  'RequestCancelExternalWorkflowExecutionInitiated',
  'UpsertWorkflowSearchAttributes',
  'WorkflowExecutionUpdateAccepted',
  'WorkflowExecutionUpdateAdmitted',
  'WorkflowExecutionUpdateCompleted',
  'WorkflowExecutionUpdateRejected',
  'WorkflowExecutionUpdateRequested',
  'WorkflowPropertiesModified',
] as const;

export const eventAttributeKeys: readonly EventAttributeKey[] = [
  'workflowExecutionStartedEventAttributes',
  'workflowExecutionCompletedEventAttributes',
  'workflowExecutionFailedEventAttributes',
  'workflowExecutionTimedOutEventAttributes',
  'workflowExecutionOptionsUpdatedEventAttributes',
  'workflowTaskStartedEventAttributes',
  'workflowTaskScheduledEventAttributes',
  'workflowTaskCompletedEventAttributes',
  'workflowTaskTimedOutEventAttributes',
  'workflowTaskFailedEventAttributes',
  'activityTaskScheduledEventAttributes',
  'activityTaskCompletedEventAttributes',
  'activityTaskStartedEventAttributes',
  'activityTaskFailedEventAttributes',
  'activityTaskTimedOutEventAttributes',
  'timerStartedEventAttributes',
  'timerFiredEventAttributes',
  'activityTaskCancelRequestedEventAttributes',
  'activityTaskCanceledEventAttributes',
  'timerCanceledEventAttributes',
  'markerRecordedEventAttributes',
  'workflowExecutionSignaledEventAttributes',
  'workflowExecutionTerminatedEventAttributes',
  'workflowExecutionUpdateAdmittedEventAttributes',
  'workflowExecutionUpdateAcceptedEventAttributes',
  'workflowExecutionUpdateCompletedEventAttributes',
  'workflowExecutionUpdateRejectedEventAttributes',
  'workflowExecutionCancelRequestedEventAttributes',
  'workflowExecutionCanceledEventAttributes',
  'requestCancelExternalWorkflowExecutionInitiatedEventAttributes',
  'requestCancelExternalWorkflowExecutionFailedEventAttributes',
  'externalWorkflowExecutionCancelRequestedEventAttributes',
  'workflowExecutionContinuedAsNewEventAttributes',
  'startChildWorkflowExecutionInitiatedEventAttributes',
  'startChildWorkflowExecutionFailedEventAttributes',
  'childWorkflowExecutionStartedEventAttributes',
  'childWorkflowExecutionCompletedEventAttributes',
  'childWorkflowExecutionFailedEventAttributes',
  'childWorkflowExecutionCanceledEventAttributes',
  'childWorkflowExecutionTimedOutEventAttributes',
  'childWorkflowExecutionTerminatedEventAttributes',
  'signalExternalWorkflowExecutionInitiatedEventAttributes',
  'signalExternalWorkflowExecutionFailedEventAttributes',
  'externalWorkflowExecutionSignaledEventAttributes',
  'upsertWorkflowSearchAttributesEventAttributes',
  'nexusOperationScheduledEventAttributes',
  'nexusOperationStartedEventAttributes',
  'nexusOperationCompletedEventAttributes',
  'nexusOperationFailedEventAttributes',
  'nexusOperationCanceledEventAttributes',
  'nexusOperationTimedOutEventAttributes',
  'nexusOperationCancelRequestedEventAttributes',
  'nexusOperationCancelRequestCompletedEventAttributes',
  'nexusOperationCancelRequestFailedEventAttributes',
  'workflowExecutionOptionsUpdatedEventAttributes',
  'workflowPropertiesModifiedEventAttributes',
  'workflowExecutionPausedEventAttributes',
  'workflowExecutionUnpausedEventAttributes',
] as const;

export type ResetEventType = (typeof validResetEventTypes)[number];
export const validResetEventTypes = [
  'WorkflowTaskCompleted',
  'WorkflowTaskFailed',
  'WorkflowTaskTimedOut',
];

export const findAttributeKey = (event: HistoryEvent): EventAttributeKey => {
  for (const key of eventAttributeKeys) {
    if (key in event) return key;
  }
};

export const findAttributes = (
  event: HistoryEvent,
  key: EventAttributeKey,
): EventAttribute => {
  return event[key];
};

export const findAttributesAndKey = (
  event: HistoryEvent,
): { key: EventAttributeKey; attributes: EventAttribute } => {
  const key = findAttributeKey(event);
  const attributes = findAttributes(event, key);

  return { key, attributes };
};

const hasAttributes =
  <T extends EventWithAttributes<EventAttributeKey>>(key: EventAttributeKey) =>
  (
    event: IterableEvent | CommonHistoryEvent | HistoryEvent | undefined,
  ): event is T => {
    return Boolean(event?.[key]);
  };

export const isWorkflowExecutionStartedEvent =
  hasAttributes<WorkflowExecutionStartedEvent>(
    'workflowExecutionStartedEventAttributes',
  );

export const isWorkflowExecutionCompletedEvent =
  hasAttributes<WorkflowExecutionCompletedEvent>(
    'workflowExecutionCompletedEventAttributes',
  );

export const isWorkflowExecutionFailedEvent =
  hasAttributes<WorkflowExecutionFailedEvent>(
    'workflowExecutionFailedEventAttributes',
  );

export const isWorkflowExecutionTimedOutEvent =
  hasAttributes<WorkflowExecutionTimedOutEvent>(
    'workflowExecutionTimedOutEventAttributes',
  );

export const isWorkflowTaskScheduledEvent =
  hasAttributes<WorkflowTaskScheduledEvent>(
    'workflowTaskScheduledEventAttributes',
  );

export const isWorkflowTaskStartedEvent =
  hasAttributes<WorkflowTaskStartedEvent>('workflowTaskStartedEventAttributes');

export const isWorkflowTaskCompletedEvent =
  hasAttributes<WorkflowTaskCompletedEvent>(
    'workflowTaskCompletedEventAttributes',
  );

export const isWorkflowTaskTimedOutEvent =
  hasAttributes<WorkflowTaskTimedOutEvent>(
    'workflowTaskTimedOutEventAttributes',
  );

export const isPureWorkflowTaskFailedEvent =
  hasAttributes<WorkflowTaskFailedEvent>('workflowTaskFailedEventAttributes');

export const isWorkflowTaskFailedEvent = (event: WorkflowEvent) => {
  return (
    isPureWorkflowTaskFailedEvent(event) &&
    event.workflowTaskFailedEventAttributes?.failure?.message !==
      'UnhandledCommand' &&
    !event.workflowTaskFailedEventAttributes?.failure?.resetWorkflowFailureInfo
  );
};

export const isActivityTaskScheduledEvent =
  hasAttributes<ActivityTaskScheduledEvent>(
    'activityTaskScheduledEventAttributes',
  );

export const isActivityTaskStartedEvent =
  hasAttributes<ActivityTaskStartedEvent>('activityTaskStartedEventAttributes');

export const isActivityTaskCompletedEvent =
  hasAttributes<ActivityTaskCompletedEvent>(
    'activityTaskCompletedEventAttributes',
  );

export const isActivityTaskFailedEvent = hasAttributes<ActivityTaskFailedEvent>(
  'activityTaskFailedEventAttributes',
);

export const isActivityTaskTimedOutEvent =
  hasAttributes<ActivityTaskTimedOutEvent>(
    'activityTaskTimedOutEventAttributes',
  );

export const isTimerStartedEvent = hasAttributes<TimerStartedEvent>(
  'timerStartedEventAttributes',
);

export const isTimerFiredEvent = hasAttributes<TimerFiredEvent>(
  'timerFiredEventAttributes',
);

export const isActivityTaskCancelRequestedEvent =
  hasAttributes<ActivityTaskCancelRequestedEvent>(
    'activityTaskCancelRequestedEventAttributes',
  );

export const isActivityTaskCanceledEvent =
  hasAttributes<ActivityTaskCanceledEvent>(
    'activityTaskCanceledEventAttributes',
  );

export const isTimerCanceledEvent = hasAttributes<TimerCanceledEvent>(
  'timerCanceledEventAttributes',
);

export const isMarkerRecordedEvent = hasAttributes<MarkerRecordedEvent>(
  'markerRecordedEventAttributes',
);

export const isWorkflowExecutionOptionsUpdatedEvent =
  hasAttributes<WorkflowExecutionOptionsUpdatedEvent>(
    'workflowExecutionOptionsUpdatedEventAttributes',
  );

export const isWorkflowExecutionSignaledEvent =
  hasAttributes<WorkflowExecutionSignaledEvent>(
    'workflowExecutionSignaledEventAttributes',
  );

export const isWorkflowExecutionTerminatedEvent =
  hasAttributes<WorkflowExecutionTerminatedEvent>(
    'workflowExecutionTerminatedEventAttributes',
  );

export const isWorkflowExecutionCancelRequestedEvent =
  hasAttributes<WorkflowExecutionCancelRequestedEvent>(
    'workflowExecutionCancelRequestedEventAttributes',
  );

export const isWorkflowExecutionCanceledEvent =
  hasAttributes<WorkflowExecutionCanceledEvent>(
    'workflowExecutionCanceledEventAttributes',
  );

export const isRequestCancelExternalWorkflowExecutionInitiatedEvent =
  hasAttributes<RequestCancelExternalWorkflowExecutionInitiatedEvent>(
    'requestCancelExternalWorkflowExecutionInitiatedEventAttributes',
  );

export const isRequestCancelExternalWorkflowExecutionFailedEvent =
  hasAttributes<RequestCancelExternalWorkflowExecutionFailedEvent>(
    'requestCancelExternalWorkflowExecutionFailedEventAttributes',
  );

export const isExternalWorkflowExecutionCancelRequestedEvent =
  hasAttributes<ExternalWorkflowExecutionCancelRequestedEvent>(
    'externalWorkflowExecutionCancelRequestedEventAttributes',
  );

export const isWorkflowExecutionContinuedAsNewEvent =
  hasAttributes<WorkflowExecutionContinuedAsNewEvent>(
    'workflowExecutionContinuedAsNewEventAttributes',
  );

export const isStartChildWorkflowExecutionInitiatedEvent =
  hasAttributes<StartChildWorkflowExecutionInitiatedEvent>(
    'startChildWorkflowExecutionInitiatedEventAttributes',
  );

export const isStartChildWorkflowExecutionFailedEvent =
  hasAttributes<StartChildWorkflowExecutionFailedEvent>(
    'startChildWorkflowExecutionFailedEventAttributes',
  );

export const isChildWorkflowExecutionStartedEvent =
  hasAttributes<ChildWorkflowExecutionStartedEvent>(
    'childWorkflowExecutionStartedEventAttributes',
  );

export const isChildWorkflowExecutionCompletedEvent =
  hasAttributes<ChildWorkflowExecutionCompletedEvent>(
    'childWorkflowExecutionCompletedEventAttributes',
  );

export const isChildWorkflowExecutionFailedEvent =
  hasAttributes<ChildWorkflowExecutionFailedEvent>(
    'childWorkflowExecutionFailedEventAttributes',
  );

export const isChildWorkflowExecutionCanceledEvent =
  hasAttributes<ChildWorkflowExecutionCanceledEvent>(
    'childWorkflowExecutionCanceledEventAttributes',
  );

export const isChildWorkflowExecutionTimedOutEvent =
  hasAttributes<ChildWorkflowExecutionTimedOutEvent>(
    'childWorkflowExecutionTimedOutEventAttributes',
  );

export const isChildWorkflowExecutionTerminatedEvent =
  hasAttributes<ChildWorkflowExecutionTerminatedEvent>(
    'childWorkflowExecutionTerminatedEventAttributes',
  );

export const isSignalExternalWorkflowExecutionInitiatedEvent =
  hasAttributes<SignalExternalWorkflowExecutionInitiatedEvent>(
    'signalExternalWorkflowExecutionInitiatedEventAttributes',
  );

export const isSignalExternalWorkflowExecutionFailedEvent =
  hasAttributes<SignalExternalWorkflowExecutionFailedEvent>(
    'signalExternalWorkflowExecutionFailedEventAttributes',
  );

export const isExternalWorkflowExecutionSignaledEvent =
  hasAttributes<ExternalWorkflowExecutionSignaledEvent>(
    'externalWorkflowExecutionSignaledEventAttributes',
  );

export const isUpsertWorkflowSearchAttributesEvent =
  hasAttributes<UpsertWorkflowSearchAttributesEvent>(
    'upsertWorkflowSearchAttributesEventAttributes',
  );

export const isResetEvent = (event: WorkflowEvent): boolean => {
  return validResetEventTypes.includes(event.eventType);
};

const localActivityMarkerNames = ['LocalActivity', 'core_local_activity'];

export const isLocalActivityMarkerEvent = (
  event: IterableEvent | CommonHistoryEvent,
) => {
  if (!isMarkerRecordedEvent(event)) return false;

  if (
    !localActivityMarkerNames.includes(
      event.markerRecordedEventAttributes.markerName,
    )
  ) {
    return false;
  }

  return true;
};

export const isWorkflowExecutionUpdateAcceptedEvent =
  hasAttributes<WorkflowExecutionUpdateAcceptedEvent>(
    'workflowExecutionUpdateAcceptedEventAttributes',
  );

export const isWorkflowExecutionUpdateRejectedEvent =
  hasAttributes<WorkflowExecutionUpdateRejectedEvent>(
    'workflowExecutionUpdateRejectedEventAttributes',
  );

export const isWorkflowExecutionUpdateAdmittedEvent =
  hasAttributes<WorkflowExecutionUpdateAdmittedEvent>(
    'workflowExecutionUpdateAdmittedEventAttributes',
  );

export const isWorkflowExecutionUpdateCompletedEvent =
  hasAttributes<WorkflowExecutionUpdateCompletedEvent>(
    'workflowExecutionUpdateCompletedEventAttributes',
  );

export const isFailedWorkflowExecutionUpdateCompletedEvent = (
  event: WorkflowEvent,
): boolean =>
  isWorkflowExecutionUpdateCompletedEvent(event) &&
  Boolean(
    event.workflowExecutionUpdateCompletedEventAttributes.outcome?.failure,
  );

export const isNexusOperationScheduledEvent =
  hasAttributes<NexusOperationScheduledEvent>(
    'nexusOperationScheduledEventAttributes',
  );

export const isNexusOperationStartedEvent =
  hasAttributes<NexusOperationStartedEvent>(
    'nexusOperationStartedEventAttributes',
  );

export const isNexusOperationCompletedEvent =
  hasAttributes<NexusOperationCompletedEvent>(
    'nexusOperationCompletedEventAttributes',
  );

export const isNexusOperationFailedEvent =
  hasAttributes<NexusOperationFailedEvent>(
    'nexusOperationFailedEventAttributes',
  );

export const isNexusOperationCanceledEvent =
  hasAttributes<NexusOperationCanceledEvent>(
    'nexusOperationCanceledEventAttributes',
  );

export const isNexusOperationTimedOutEvent =
  hasAttributes<NexusOperationTimedOutEvent>(
    'nexusOperationTimedOutEventAttributes',
  );

export const isNexusOperationCancelRequestedEvent =
  hasAttributes<NexusOperationCancelRequestedEvent>(
    'nexusOperationCancelRequestedEventAttributes',
  );
