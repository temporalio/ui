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
  isWorkflowExecutionCanceledEvent,
  isWorkflowExecutionFailedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionStartedEvent,
  isWorkflowExecutionTerminatedEvent,
  isWorkflowTaskCompletedEvent,
  isWorkflowTaskFailedEvent,
  isWorkflowTaskScheduledEvent,
  isWorkflowTaskTimedOutEvent,
} from '$lib/utilities/is-event-type';

export const getPrimaryEventDetail = (
  event: WorkflowEvent,
): string | number => {
  if (isWorkflowExecutionStartedEvent(event)) {
    console.log('WorkflowExecutionStartedEvent: ', event);
    return event.workflowExecutionStartedEventAttributes.attempt;
  }

  if (isWorkflowExecutionCanceledEvent(event)) {
    console.log('WorkflowExecutionCanceledEvent: ', event);
    return (
      event.workflowExecutionCanceledEventAttributes?.details ?? 'No details'
    );
  }

  if (isWorkflowExecutionFailedEvent(event)) {
    console.log('WorkflowExecutionFailedEvent: ', event);
    return (
      event.workflowExecutionFailedEventAttributes.failure.cause?.cause
        ?.message ??
      event.workflowExecutionFailedEventAttributes.failure?.message
    );
  }

  if (isWorkflowExecutionTerminatedEvent(event)) {
    console.log('WorkflowExecutionTerminatedEvent: ', event);
    return event.workflowExecutionTerminatedEventAttributes.reason;
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    console.log('StartChildWorkflowExecutionInitiatedEvent: ', event);
    return event.startChildWorkflowExecutionInitiatedEventAttributes
      ?.workflowType?.name;
  }

  if (isChildWorkflowExecutionStartedEvent(event)) {
    console.log('ChildWorkflowExecutionStartedEvent: ', event);
    return event.childWorkflowExecutionStartedEventAttributes?.workflowType
      ?.name;
  }

  if (isChildWorkflowExecutionCompletedEvent(event)) {
    console.log('ChildWorkflowExecutionCompletedEvent: ', event);
    return event.childWorkflowExecutionCompletedEventAttributes?.workflowType
      ?.name;
  }

  if (isWorkflowTaskCompletedEvent(event)) {
    console.log('WorkflowTaskCompletedEvent: ', event);
    return event.workflowTaskCompletedEventAttributes.identity;
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    console.log('WorkflowExecutionSignaledEvent: ', event);
    return event.workflowExecutionSignaledEventAttributes?.signalName;
  }

  if (isWorkflowTaskScheduledEvent(event)) {
    console.log('WorkflowTaskScheduledEvent: ', event);
    return event.workflowTaskScheduledEventAttributes?.taskQueue?.name;
  }

  if (isWorkflowTaskFailedEvent(event)) {
    console.log('WorkflowTaskFailedEvent: ', event);
    return event.workflowTaskFailedEventAttributes?.cause;
  }

  if (isWorkflowTaskTimedOutEvent(event)) {
    console.log('WorkflowTaskTimedOutEvent: ', event);
    return event.workflowTaskTimedOutEventAttributes?.timeoutType;
  }

  if (isActivityTaskCompletedEvent(event)) {
    console.log('ActivityTaskCompletedEvent: ', event);
    return event.activityTaskCompletedEventAttributes?.identity;
  }

  if (isActivityTaskFailedEvent(event)) {
    console.log('ActivityTaskFailedEvent: ', event);
    return (
      event.activityTaskFailedEventAttributes?.failure.cause?.cause?.message ??
      event.activityTaskFailedEventAttributes.failure?.message
    );
  }

  if (isActivityTaskCanceledEvent(event)) {
    console.log('ActivityTaskCanceledEvent: ', event);
    return 'Task Canceled...';
    // return event.activityTaskCanceledEventAttributes.details;
  }

  if (isActivityTaskScheduledEvent(event)) {
    console.log('ActivityTaskScheduledEvent: ', event);
    return event.activityTaskScheduledEventAttributes?.activityType?.name;
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      console.log('LocalActivityMarkerEvent: ', event);
      return event.eventType;
    }
    console.log('MarkerRecordedEvent: ', event);
    return event.markerRecordedEventAttributes.markerName;
  }

  if (isTimerStartedEvent(event)) {
    console.log('TimerStartedEvent: ', event);
    return event.timerStartedEventAttributes?.startToFireTimeout;
    // return event.timerStartedEventAttributes?.timerId;
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    console.log('SignalExternalWorkflowExecutionInitiatedEvent: ', event);
    return event.signalExternalWorkflowExecutionInitiatedEventAttributes;
  }

  console.log('Missing Label Event: ', event);
  return 'Missing Label';
};

type PotentiallyDecodable =
  | Record<string | number | symbol, unknown>
  | EventAttribute;

export const getAttributePayloads = (attributes: PotentiallyDecodable) => {
  const payloadAttributes = [];

  const findPayloadAttributes = (
    attributes: PotentiallyDecodable,
    payloadsKey?: string,
  ) => {
    for (const key of Object.keys(attributes)) {
      if (key === 'payloads' || key === 'failure' || key === 'lastFailure') {
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

  findPayloadAttributes(attributes);

  return payloadAttributes;
};
