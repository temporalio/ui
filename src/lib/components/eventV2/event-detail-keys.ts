import { isEventGroup } from '$lib/models/event-groups';
import {
  formatSummaryValue,
  getActivityType,
} from '$lib/utilities/get-single-attribute-for-event';
import { isObject } from '$lib/utilities/is';
import {
  isActivityTaskCanceledEvent,
  isActivityTaskCompletedEvent,
  isActivityTaskFailedEvent,
  isActivityTaskScheduledEvent,
  isChildWorkflowExecutionCompletedEvent,
  isChildWorkflowExecutionStartedEvent,
  isLocalActivityMarkerEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isUpsertWorkflowSearchAttributesEvent,
  isWorkflowExecutionCanceledEvent,
  isWorkflowExecutionCompletedEvent,
  isWorkflowExecutionFailedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionStartedEvent,
  isWorkflowExecutionTerminatedEvent,
  isWorkflowExecutionTimedOutEvent,
  isWorkflowTaskCompletedEvent,
  isWorkflowTaskFailedEvent,
  isWorkflowTaskScheduledEvent,
  isWorkflowTaskStartedEvent,
  isWorkflowTaskTimedOutEvent,
} from '$lib/utilities/is-event-type';

type BadgeType =
  | 'alpha'
  | 'beta'
  | 'warning'
  | 'error'
  | 'default'
  | 'count'
  | 'active'
  | 'available'
  | 'running'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'gray'
  | 'white';
type SummaryAttribute = {
  key: string;
  value: string | Record<string, unknown>;
  badge?: BadgeType;
};

export const eventGroupDisplayName = (
  event: IterableEvent,
  inSubGroup: boolean,
) => {
  const hasGroupEvents = isEventGroup(event) && event.eventList.length > 1;
  const singleEvent = isEventGroup(event) ? event.initialEvent : event;

  if (inSubGroup) {
    return singleEvent?.classification ?? singleEvent?.name;
  }

  if (hasGroupEvents) {
    if (isLocalActivityMarkerEvent(event.initialEvent)) return 'Local Activity';
    if (isSignalExternalWorkflowExecutionInitiatedEvent(event.initialEvent))
      return 'Signal Sent';
    if (isWorkflowTaskScheduledEvent(event.initialEvent))
      return 'Workflow Task';
    if (isWorkflowExecutionSignaledEvent(event.initialEvent))
      return 'Signal Received';
    if (isSignalExternalWorkflowExecutionInitiatedEvent(event.initialEvent))
      return 'Signal Sent';
    if (isStartChildWorkflowExecutionInitiatedEvent(event.initialEvent))
      return 'Child Workflow';
    if (isActivityTaskScheduledEvent(event.initialEvent))
      return 'Activity Task';
    if (isTimerStartedEvent(event.initialEvent)) return 'Timer';
  }

  if (isMarkerRecordedEvent(singleEvent)) return 'Marker';
  if (isWorkflowExecutionSignaledEvent(singleEvent)) return 'Signal Received';
  if (isSignalExternalWorkflowExecutionInitiatedEvent(singleEvent))
    return 'Signal Sent';
  if (isUpsertWorkflowSearchAttributesEvent(singleEvent))
    return 'Search Attributes';
  if (
    isWorkflowExecutionStartedEvent(singleEvent) ||
    isWorkflowExecutionCanceledEvent(singleEvent) ||
    isWorkflowExecutionFailedEvent(singleEvent) ||
    isWorkflowExecutionTimedOutEvent(singleEvent) ||
    isWorkflowExecutionTerminatedEvent(singleEvent) ||
    isWorkflowExecutionCompletedEvent(singleEvent)
  )
    return 'Workflow';

  // if (isTimerStartedEvent(singleEvent)) return 'Started';

  return singleEvent?.name;
};

export const getPrimaryIterableEventDetails = (
  event: IterableEvent,
): SummaryAttribute[] => {
  if (isEventGroup(event)) {
    return getPrimaryEventGroupDetails(event);
  }
  return [getPrimaryEventDetails(event)];
};

export const getPrimaryEventGroupDetails = (
  group: EventGroup,
): SummaryAttribute[] => {
  // Special case
  const events = group.eventList;
  if (events.find((event) => isWorkflowTaskScheduledEvent(event))) {
    const scheduled = events.find((event) =>
      isWorkflowTaskScheduledEvent(event),
    );
    const scheduledDetails = getPrimaryEventDetails(scheduled);
    const started = events.find((event) => isWorkflowTaskStartedEvent(event));
    if (started) {
      const startedDetails = getPrimaryEventDetails(started);
      return [
        { ...startedDetails, badge: 'gray' },
        { ...scheduledDetails, badge: 'gray' },
      ];
    } else {
      return [{ ...scheduledDetails, badge: 'gray' }];
    }
  }

  return [getPrimaryEventDetails(group.initialEvent)];
};

export const getPrimaryEventDetails = (
  event: WorkflowEvent,
): SummaryAttribute => {
  if (isWorkflowExecutionStartedEvent(event)) {
    return formatSummaryValue(
      'Attempt',
      event.workflowExecutionStartedEventAttributes.attempt,
    );
  }

  if (isWorkflowExecutionCanceledEvent(event)) {
    return formatSummaryValue(
      'Details',
      event.workflowExecutionCanceledEventAttributes?.details ?? '',
    );
  }

  if (isWorkflowExecutionFailedEvent(event)) {
    const message =
      event.workflowExecutionFailedEventAttributes.failure.cause?.cause
        ?.message ??
      event.workflowExecutionFailedEventAttributes.failure?.message;
    return formatSummaryValue('Message', message);
  }

  if (isWorkflowExecutionTerminatedEvent(event)) {
    return formatSummaryValue(
      'Reason',
      event.workflowExecutionTerminatedEventAttributes.reason,
    );
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return formatSummaryValue(
      'WorkflowType',
      event.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType
        ?.name,
    );
  }

  if (isChildWorkflowExecutionStartedEvent(event)) {
    return formatSummaryValue(
      'WorkflowType',
      event.childWorkflowExecutionStartedEventAttributes?.workflowType?.name,
    );
  }

  if (isChildWorkflowExecutionCompletedEvent(event)) {
    return formatSummaryValue(
      'WorkflowType',
      event.childWorkflowExecutionCompletedEventAttributes?.workflowType?.name,
    );
  }

  if (isWorkflowTaskScheduledEvent(event)) {
    return formatSummaryValue(
      'TaskQueueKind',
      event.workflowTaskScheduledEventAttributes.taskQueue.kind,
    );
  }

  if (isWorkflowTaskStartedEvent(event)) {
    return formatSummaryValue(
      'Identity',
      event.workflowTaskStartedEventAttributes.identity,
    );
  }

  if (isWorkflowTaskCompletedEvent(event)) {
    return formatSummaryValue(
      'Identity',
      event.workflowTaskCompletedEventAttributes.identity,
    );
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return formatSummaryValue(
      'SignalName',
      event.workflowExecutionSignaledEventAttributes?.signalName,
    );
  }

  if (isWorkflowTaskScheduledEvent(event)) {
    return formatSummaryValue(
      'TaskQueue',
      event.workflowTaskScheduledEventAttributes?.taskQueue?.name,
    );
  }

  if (isWorkflowTaskFailedEvent(event)) {
    return formatSummaryValue(
      'Cause',
      event.workflowTaskFailedEventAttributes?.cause,
    );
  }

  if (isWorkflowTaskTimedOutEvent(event)) {
    return formatSummaryValue(
      'TimeoutType',
      event.workflowTaskTimedOutEventAttributes?.timeoutType,
    );
  }

  if (isActivityTaskCompletedEvent(event)) {
    return formatSummaryValue(
      'Identity',
      event.activityTaskCompletedEventAttributes?.identity,
    );
  }

  if (isActivityTaskFailedEvent(event)) {
    const message =
      event.activityTaskFailedEventAttributes?.failure.cause?.cause?.message ??
      event.activityTaskFailedEventAttributes.failure?.message;
    return formatSummaryValue('Message', message);
  }

  if (isActivityTaskCanceledEvent(event)) {
    return formatSummaryValue(
      'Details',
      event.activityTaskCanceledEventAttributes.details,
    );
  }

  if (isActivityTaskScheduledEvent(event)) {
    return formatSummaryValue(
      'ActivityType',
      event.activityTaskScheduledEventAttributes?.activityType?.name,
    );
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      const payload =
        event.markerRecordedEventAttributes?.details?.data?.payloads?.[0];

      const activityType = getActivityType(payload);

      if (activityType) {
        return formatSummaryValue('ActivityType', activityType);
      }
      return formatSummaryValue('ActivityType', event.eventType);
    }
    return formatSummaryValue(
      'MarkerName',
      event.markerRecordedEventAttributes.markerName,
    );
  }

  if (isTimerStartedEvent(event)) {
    return formatSummaryValue(
      'StartToFireTimeout',
      event.timerStartedEventAttributes?.startToFireTimeout,
    );
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return formatSummaryValue(
      'SignalName',
      event.signalExternalWorkflowExecutionInitiatedEventAttributes?.signalName,
    );
  }

  return formatSummaryValue('', '');
};

type PotentiallyDecodable =
  | Record<string | number | symbol, unknown>
  | EventAttribute;

const payloadAttributeFields = [
  'input',
  'failure',
  'lastFailure',
  'searchAttributes',
];
export const getAttributePayloads = (attributes: PotentiallyDecodable) => {
  const payloadAttributes = [];

  const findPayloadAttributes = (
    attributes: PotentiallyDecodable,
    payloadsKey?: string,
  ) => {
    for (const key of Object.keys(attributes)) {
      const value = !!attributes[key];
      if (payloadAttributeFields.includes(key) && value) {
        payloadAttributes.push({
          key: payloadsKey ?? key,
          value: attributes[key],
        });
      } else {
        const next = attributes[key];
        if (isObject(next)) {
          findPayloadAttributes(next, key);
        }
      }
    }
  };

  if (attributes) findPayloadAttributes(attributes);

  return payloadAttributes;
};
