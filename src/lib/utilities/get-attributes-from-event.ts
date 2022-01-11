import * as eventTypes from './is-event-type';
import { pick } from './pick';

interface EventSummary {
  type: string;
  attributes: Partial<EventAttribute>;
}

export const getAttributesFromEvent = (event: unknown): EventSummary => {
  if (eventTypes.isActivityTaskCancelRequestedEvent(event)) {
    return {
      type: 'activityTaskCancelRequestedEventAttributes',
      attributes: pick(
        event.activityTaskCancelRequestedEventAttributes,
        'workflowTaskCompletedEventId',
      ),
    };
  }
  if (eventTypes.isActivityTaskCompletedEvent(event)) {
    return {
      type: 'activityTaskCompletedEventAttributes',
      attributes: pick(event.activityTaskCompletedEventAttributes, 'result'),
    };
  }
  if (eventTypes.isActivityTaskFailedEvent(event)) {
    return {
      type: 'activityTaskFailedEventAttributes',
      attributes: pick(
        event.activityTaskFailedEventAttributes,
        'failure',
        'identity',
        'startedEventId',
      ),
    };
  }
  if (eventTypes.isActivityTaskScheduledEvent(event)) {
    return {
      type: 'activityTaskScheduledEventAttributes',
      attributes: pick(
        event.activityTaskScheduledEventAttributes,
        'input',
        'activityId',
        'scheduleToCloseTimeout',
      ),
    };
  }
  if (eventTypes.isActivityTaskStartedEvent(event)) {
    return {
      type: 'activityTaskStartedEventAttributes',
      attributes: pick(
        event.activityTaskStartedEventAttributes,
        'lastFailure',
        'attempt',
      ),
    };
  }
  if (eventTypes.isActivityTaskTimedOutEvent(event)) {
    return {
      type: 'activityTaskTimedOutEventAttributes',
      attributes: pick(
        event.activityTaskTimedOutEventAttributes,
        'failure',
        'startedEventId',
      ),
    };
  }
  if (eventTypes.isChildWorkflowExecutionCompletedEvent(event)) {
    return {
      type: 'childWorkflowExecutionCompletedEventAttributes',
      attributes: pick(
        event.childWorkflowExecutionCompletedEventAttributes,
        'result',
        'initiatedEventId',
      ),
    };
  }
  if (eventTypes.isChildWorkflowExecutionStartedEvent(event)) {
    return {
      type: 'childWorkflowExecutionStartedEventAttributes',
      attributes: pick(
        event.childWorkflowExecutionStartedEventAttributes,
        'initiatedEventId',
      ),
    };
  }
  if (eventTypes.isWorkflowTaskCompletedEvent(event)) {
    return {
      type: 'workflowTaskCompletedEventAttributes',
      attributes: pick(
        event.workflowTaskCompletedEventAttributes,
        'identity',
        'startedEventId',
      ),
    };
  }
  if (eventTypes.isWorkflowTaskScheduledEvent(event)) {
    return {
      type: 'workflowTaskScheduledEventAttributes',
      attributes: pick(
        event.workflowTaskScheduledEventAttributes,
        'startToCloseTimeout',
      ),
    };
  }
  if (eventTypes.isWorkflowTaskStartedEvent(event)) {
    return {
      type: 'workflowTaskStartedEventAttributes',
      attributes: pick(
        event.workflowTaskStartedEventAttributes,
        'identity',
        'requestId',
      ),
    };
  }
  if (eventTypes.isWorkflowTaskTimedOutEvent(event)) {
    return {
      type: 'workflowTaskTimedOutEventAttributes',
      attributes: pick(
        event.workflowTaskTimedOutEventAttributes,
        'timeoutType',
        'scheduledEventId',
      ),
    };
  }
  if (eventTypes.isExternalWorkflowExecutionSignaledEvent(event)) {
    return {
      type: 'externalWorkflowExecutionSignaledEventAttributes',
      attributes: pick(
        event.externalWorkflowExecutionSignaledEventAttributes,
        'workflowExecution',
        'initiatedEventId',
      ),
    };
  }
  if (eventTypes.isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return {
      type: 'startChildWorkflowExecutionInitiatedEventAttributes',
      attributes: pick(
        event.startChildWorkflowExecutionInitiatedEventAttributes,
        'input',
        'workflowId',
        'workflowTaskTimeout',
      ),
    };
  }
  if (eventTypes.isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return {
      type: 'signalExternalWorkflowExecutionInitiatedEventAttributes',
      attributes: pick(
        event.signalExternalWorkflowExecutionInitiatedEventAttributes,
        'input',
        'workflowTaskCompletedEventId',
      ),
    };
  }
  if (eventTypes.isTimerStartedEvent(event)) {
    return {
      type: 'timerStartedEventAttributes',
      attributes: pick(event.timerStartedEventAttributes, 'startToFireTimeout'),
    };
  }
  if (eventTypes.isWorkflowExecutionStartedEvent(event)) {
    return {
      type: 'workflowExecutionStartedEventAttributes',
      attributes: pick(
        event.workflowExecutionStartedEventAttributes,
        'input',
        'attempt',
        'lastCompletionResult',
      ),
    };
  }
  if (eventTypes.isWorkflowExecutionCompletedEvent(event)) {
    return {
      type: 'workflowExecutionCompletedEventAttributes',
      attributes: pick(
        event.workflowExecutionCompletedEventAttributes,
        'result',
        'workflowTaskCompletedEventId',
      ),
    };
  }
  if (eventTypes.isWorkflowExecutionFailedEvent(event)) {
    return {
      type: 'workflowExecutionFailedEventAttributes',
      attributes: pick(
        event.workflowExecutionFailedEventAttributes,
        'failure',
        'newExecutionRunId',
        'retryState',
      ),
    };
  }
  if (eventTypes.isWorkflowExecutionTimedOutEvent(event)) {
    return {
      type: 'workflowExecutionTimedOutEventAttributes',
      attributes: pick(
        event.workflowExecutionTimedOutEventAttributes,
        'retryState',
      ),
    };
  }
  if (eventTypes.isWorkflowTaskFailedEvent(event)) {
    return {
      type: 'workflowTaskFailedEventAttributes',
      attributes: pick(
        event.workflowTaskFailedEventAttributes,
        'failure',
        'newRunId',
        'startedEventId',
      ),
    };
  }
  if (eventTypes.isChildWorkflowExecutionFailedEvent(event)) {
    return {
      type: 'childWorkflowExecutionFailedEventAttributes',
      attributes: pick(
        event.childWorkflowExecutionFailedEventAttributes,
        'failure',
        'retryState',
        'startedEventId',
      ),
    };
  }
};
