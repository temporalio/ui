import type { IconName } from '$lib/holocene/icon/paths';
import {
  isActivityTaskCompletedEvent,
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
  isWorkflowTaskCompletedEvent,
  isWorkflowTaskFailedEvent,
  isWorkflowTaskScheduledEvent,
  isWorkflowTaskTimedOutEvent,
} from '$lib/utilities/is-event-type';

export const allowedKeys = [
  'eventTime',
  'identity',
  'signalName',
  'markerName',
  // 'details',
  // 'input',
  'namespace',
  'startToFireTimeout',
];

export const getPrimaryEventDetail = (
  event: WorkflowEvent,
): { icon: IconName; label: string | number } => {
  if (isWorkflowExecutionStartedEvent(event)) {
    console.log('WorkflowExecutionStartedEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.workflowExecutionStartedEventAttributes.attempt,
    };
  }

  if (isWorkflowExecutionCanceledEvent(event)) {
    console.log('WorkflowExecutionCanceledEvent: ', event);
    return {
      icon: 'eye-show',
      label:
        event.workflowExecutionCanceledEventAttributes?.details ?? 'No details',
    };
  }

  if (isWorkflowExecutionFailedEvent(event)) {
    console.log('WorkflowExecutionFailedEvent: ', event);
    return {
      icon: 'eye-show',
      label:
        event.workflowExecutionFailedEventAttributes.failure.cause?.cause
          ?.message ??
        event.workflowExecutionFailedEventAttributes.failure?.message,
    };
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    console.log('StartChildWorkflowExecutionInitiatedEvent: ', event);
    return {
      icon: 'relationship',
      label:
        event.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType
          ?.name,
    };
  }

  if (isChildWorkflowExecutionStartedEvent(event)) {
    console.log('ChildWorkflowExecutionStartedEvent: ', event);
    return {
      icon: 'relationship',
      label:
        event.childWorkflowExecutionStartedEventAttributes?.workflowType?.name,
    };
  }

  if (isChildWorkflowExecutionCompletedEvent(event)) {
    console.log('ChildWorkflowExecutionCompletedEvent: ', event);
    return {
      icon: 'relationship',
      label:
        event.childWorkflowExecutionCompletedEventAttributes?.workflowType
          ?.name,
    };
  }

  if (isWorkflowTaskCompletedEvent(event)) {
    console.log('WorkflowTaskCompletedEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.workflowTaskCompletedEventAttributes.identity,
    };
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    console.log('WorkflowExecutionSignaledEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.workflowExecutionSignaledEventAttributes?.signalName,
    };
  }

  if (isWorkflowTaskScheduledEvent(event)) {
    console.log('WorkflowTaskScheduledEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.workflowTaskScheduledEventAttributes?.taskQueue,
    };
  }

  if (isWorkflowTaskFailedEvent(event)) {
    console.log('WorkflowTaskFailedEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.workflowTaskFailedEventAttributes?.cause,
    };
  }

  if (isWorkflowTaskTimedOutEvent(event)) {
    console.log('WorkflowTaskTimedOutEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.workflowTaskTimedOutEventAttributes?.timeoutType,
    };
  }

  if (isActivityTaskCompletedEvent(event)) {
    console.log('ActivityTaskCompletedEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.activityTaskCompletedEventAttributes?.identity,
    };
  }

  if (isActivityTaskScheduledEvent(event)) {
    console.log('ActivityTaskScheduledEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.activityTaskScheduledEventAttributes?.activityType?.name,
    };
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      console.log('LocalActivityMarkerEvent: ', event);
      return { icon: 'eye-show', label: event.eventType };
    }
    console.log('MarkerRecordedEvent: ', event);
    return {
      icon: 'eye-show',
      label: event.markerRecordedEventAttributes.markerName,
    };
  }

  if (isTimerStartedEvent(event)) {
    console.log('TimerStartedEvent: ', event);
    return {
      icon: 'clock',
      label: event.timerStartedEventAttributes?.startToFireTimeout,
    };
    // return event.timerStartedEventAttributes?.timerId;
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    console.log('SignalExternalWorkflowExecutionInitiatedEvent: ', event);
    return {
      icon: 'eye-show',
      label:
        event.signalExternalWorkflowExecutionInitiatedEventAttributes
          ?.signalName,
    };
  }

  return { icon: 'eye-show', label: 'Event Label Missing' };
};
