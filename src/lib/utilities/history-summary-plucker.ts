import * as eventTypes from '$lib/utilities/is-event-type';
import type { HistoryEvent } from '$types';

type EventAttributeType =
  | 'activityTaskCancelRequestedEventAttributes'
  | 'activityTaskCompletedEventAttributes'
  | 'activityTaskFailedEventAttributes'
  | 'activityTaskScheduledEventAttributes'
  | 'activityTaskStartedEventAttributes'
  | 'activityTaskTimedOutEventAttributes'
  | 'childWorkflowExecutionCompletedEventAttributes'
  | 'childWorkflowExecutionStartedEventAttributes'
  | 'workflowTaskCompletedEventAttributes'
  | 'workflowTaskScheduledEventAttributes'
  | 'workflowTaskStartedEventAttributes'
  | 'workflowTaskTimedOutEventAttributes'
  | 'externalWorkflowExecutionSignaledEventAttributes'
  | 'startChildWorkflowExecutionInitiatedEventAttributes'
  | 'signalExternalWorkflowExecutionInitiatedEventAttributes'
  | 'timerStartedEventAttributes'
  | 'workflowExecutionStartedEventAttributes'
  | 'workflowExecutionCompletedEventAttributes'
  | 'workflowExecutionFailedEventAttributes'
  | 'workflowExecutionTimedOutEventAttributes'
  | 'workflowTaskFailedEventAttributes'
  | 'childWorkflowExecutionFailedEventAttributes';

function pick<T, K extends keyof T>(source: T, ...keys: K[]): Pick<T, K> {
  const result: any = {};
  for (const key of keys) {
    result[key] = source[key];
  }
  return result;
}

export const getHistorySummary = (event: HistoryEvent) => {
  const { type, attributes } = getAttributesFromEvent(event);
  if (type === 'activityTaskCancelRequestedEvent') {
    attributes;
    return ({ activityId }) => ({ activityId });
  }
  if (type === 'activityTaskCompletedEvent') {
    return ({ result }) => ({ result });
  }
  if (type === 'activityTaskFailedEvent') {
    return ({ detail, reason }) => ({ detail, reason });
  }
  if (type === 'activityTaskScheduledEvent') {
    return ({ startToCloseTimeout, activityId, input, activity }) => ({
      startToCloseTimeout,
      activityId,
      input,
      activity,
    });
  }
  if (type === 'activityTaskStartedEvent') {
    return ({ attempt, identity, requestId }) => ({
      attempt,
      identity,
      requestId,
    });
  }
  if (type === 'activityTaskTimedOutEvent') {
    return ({ failure }) => ({ failure });
  }
  if (type === 'childWorkflowExecutionCompletedEvent') {
    return ({ result }) => ({ result });
  }
  if (type === 'childWorkflowExecutionStartedEvent') {
    return (event) => event;
  }
  if (type === 'workflowTaskCompletedEvent') {
    return ({ identity }) => ({ identity });
  }
  if (type === 'workflowTaskScheduledEvent') {
    return ({ taskQueue, startToCloseTimeout }) => ({
      taskQueue,
      startToCloseTimeout,
    });
  }
  if (type === 'workflowTaskStartedEvent') {
    return ({ requestId }) => ({ requestId });
  }
  if (type === 'workflowTaskTimedOutEvent') {
    return ({ timeoutType }) => ({ timeoutType });
  }
  if (type === 'externalWorkflowExecutionSignaledEvent') {
    return (eventAttrs) => eventAttrs;
  }
  if (type === 'startChildWorkflowExecutionInitiatedEvent') {
    return ({ input, taskQueue, workflowType }) => ({
      input,
      Taskqueue: taskQueue.name,
      Workflow: workflowType.name,
    });
  }
  if (type === 'signalExternalWorkflowExecutionInitiatedEvent') {
    return ({ input, signalName }) => ({ input, signalName });
  }
  if (type === 'timerStartedEvent') {
    return ({ startToFireTimeout, timerId }) => ({
      startToFireTimeout,
      timerId,
    });
  }
  if (type === 'workflowExecutionStartedEvent') {
    return ({ workflowRunTimeout, identity, input, workflowType }) => ({
      workflowRunTimeout,
      identity,
      input,
      workflowType: workflowType?.name ?? '',
    });
  }
  if (type === 'workflowExecutionCompletedEvent') {
    return ({ result, newExecutionRunId }) => ({
      result,
      newExecutionRunId,
    });
  }
  if (type === 'workflowExecutionFailedEvent') {
    return ({ failure, newExecutionRunId }) => ({
      message: failure?.message ?? '',
      newExecutionRunId,
    });
  }
  if (type === 'workflowExecutionTimedOutEvent') {
    return ({ retryState, newExecutionRunId }) => ({
      retryState,
      newExecutionRunId,
    });
  }
  if (type === 'workflowTaskFailedEvent') {
    return ({ failure }) => ({ message: failure?.message ?? '' });
  }
  if (type === 'childWorkflowExecutionFailedEvent') {
    return ({ failure }) => ({ message: failure?.message ?? '' });
  }
};

const getAttributesFromEvent = (event: unknown) => {
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
      attributes: event.activityTaskFailedEventAttributes,
    };
  }
  if (eventTypes.isActivityTaskScheduledEvent(event)) {
    return {
      type: 'activityTaskScheduledEventAttributes',
      attributes: event.activityTaskScheduledEventAttributes,
    };
  }
  if (eventTypes.isActivityTaskStartedEvent(event)) {
    return {
      type: 'activityTaskStartedEventAttributes',
      attributes: event.activityTaskStartedEventAttributes,
    };
  }
  if (eventTypes.isActivityTaskTimedOutEvent(event)) {
    return {
      type: 'activityTaskTimedOutEventAttributes',
      attributes: event.activityTaskTimedOutEventAttributes,
    };
  }
  if (eventTypes.isChildWorkflowExecutionCompletedEvent(event)) {
    return {
      type: 'childWorkflowExecutionCompletedEventAttributes',
      attributes: event.childWorkflowExecutionCompletedEventAttributes,
    };
  }
  if (eventTypes.isChildWorkflowExecutionStartedEvent(event)) {
    return {
      type: 'childWorkflowExecutionStartedEventAttributes',
      attributes: event.childWorkflowExecutionStartedEventAttributes,
    };
  }
  if (eventTypes.isWorkflowTaskCompletedEvent(event)) {
    return {
      type: 'workflowTaskCompletedEventAttributes',
      attributes: event.workflowTaskCompletedEventAttributes,
    };
  }
  if (eventTypes.isWorkflowTaskScheduledEvent(event)) {
    return {
      type: 'workflowTaskScheduledEventAttributes',
      attributes: event.workflowTaskScheduledEventAttributes,
    };
  }
  if (eventTypes.isWorkflowTaskStartedEvent(event)) {
    return {
      type: 'workflowTaskStartedEventAttributes',
      attributes: event.workflowTaskStartedEventAttributes,
    };
  }
  if (eventTypes.isWorkflowTaskTimedOutEvent(event)) {
    return {
      type: 'workflowTaskTimedOutEventAttributes',
      attributes: event.workflowTaskTimedOutEventAttributes,
    };
  }
  if (eventTypes.isExternalWorkflowExecutionSignaledEvent(event)) {
    return {
      type: 'externalWorkflowExecutionSignaledEventAttributes',
      attributes: event.externalWorkflowExecutionSignaledEventAttributes,
    };
  }
  if (eventTypes.isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return {
      type: 'startChildWorkflowExecutionInitiatedEventAttributes',
      attributes: event.startChildWorkflowExecutionInitiatedEventAttributes,
    };
  }
  if (eventTypes.isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return {
      type: 'signalExternalWorkflowExecutionInitiatedEventAttributes',
      attributes: event.signalExternalWorkflowExecutionInitiatedEventAttributes,
    };
  }
  if (eventTypes.isTimerStartedEvent(event)) {
    return {
      type: 'timerStartedEventAttributes',
      attributes: event.timerStartedEventAttributes,
    };
  }
  if (eventTypes.isWorkflowExecutionStartedEvent(event)) {
    return {
      type: 'workflowExecutionStartedEventAttributes',
      attributes: event.workflowExecutionStartedEventAttributes,
    };
  }
  if (eventTypes.isWorkflowExecutionCompletedEvent(event)) {
    return {
      type: 'workflowExecutionCompletedEventAttributes',
      attributes: event.workflowExecutionCompletedEventAttributes,
    };
  }
  if (eventTypes.isWorkflowExecutionFailedEvent(event)) {
    return {
      type: 'workflowExecutionFailedEventAttributes',
      attributes: event.workflowExecutionFailedEventAttributes,
    };
  }
  if (eventTypes.isWorkflowExecutionTimedOutEvent(event)) {
    return {
      type: 'workflowExecutionTimedOutEventAttributes',
      attributes: event.workflowExecutionTimedOutEventAttributes,
    };
  }
  if (eventTypes.isWorkflowTaskFailedEvent(event)) {
    return {
      type: 'workflowTaskFailedEventAttributes',
      attributes: event.workflowTaskFailedEventAttributes,
    };
  }
  if (eventTypes.isChildWorkflowExecutionFailedEvent(event)) {
    return {
      type: 'childWorkflowExecutionFailedEventAttributes',
      attributes: event.childWorkflowExecutionFailedEventAttributes,
    };
  }
};
