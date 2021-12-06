import type {
  ActivityTaskCancelRequestedEventAttributes,
  ActivityTaskCompletedEventAttributes,
  ActivityTaskFailedEventAttributes,
  ActivityTaskScheduledEventAttributes,
  GetWorkflowExecutionHistoryResponse,
} from '$types';

type EventAttributeKeys =
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

interface TaskCancelAttrs extends ActivityTaskCancelRequestedEventAttributes {
  type: 'activityTaskCancelRequestedEventAttribute';
}
interface TaskCompleteAttrs extends ActivityTaskCompletedEventAttributes {
  type: 'activityTaskCompletedEventAttributes';
}
interface TaskFailedAttrs extends ActivityTaskFailedEventAttributes {
  type: 'activityTaskFailedEventAttributes';
}
interface TaskScheduledAttrs extends ActivityTaskScheduledEventAttributes {
  type: 'activityTaskScheduledEventAttributes';
}
interface TaskStartedAttrs extends ActivityTaskStartedEventAttributes {
  type: 'activityTaskStartedEventAttributes';
}
interface TaskTimeoutAttrs extends ActivityTaskTimedOutEventAttributes {
  type: 'activityTaskTimedOutEventAttributes';
}
interface ChildTaskCompleteAttrs
  extends ChildWorkflowExecutionCompletedEventAttributes {
  type: 'childWorkflowExecutionCompletedEventAttributes';
}
interface ChildWorkflowStartedAttrs
  extends ChildWorkflowExecutionStartedEventAttributes {
  type: 'childWorkflowExecutionStartedEventAttributes';
}
interface TaskWorkflowCompletedAttrs
  extends WorkflowTaskCompletedEventAttributes {
  type: 'workflowTaskCompletedEventAttributes';
}
interface TaskWorfklowScheduledAttrs
  extends WorkflowTaskScheduledEventAttributes {
  type: 'workflowTaskScheduledEventAttributes';
}
interface TaskWorkflowStartedAttrs extends WorkflowTaskStartedEventAttributes {
  type: 'workflowTaskStartedEventAttributes';
}

interface TaskWorfklowTimedOut extends WorkflowTaskTimedOutEventAttributes {
  type: 'workflowTaskTimedOutEventAttributes';
}

interface ExternalWorkflowExecutionSignaledAttrs
  extends ExternalWorkflowExecutionSignaledEventAttributes {
  type: 'externalWorkflowExecutionSignaledEventAttributes';
}

interface ChildWorkflowStartExecutionInitiatedAttrs
  extends StartChildWorkflowExecutionInitiatedEventAttributes {
  type: 'startChildWorkflowExecutionInitiatedEventAttributes';
}
interface ExternalWorkflowExecutionInitiatedAttrs
  extends SignalExternalWorkflowExecutionInitiatedEventAttributes {
  type: 'signalExternalWorkflowExecutionInitiatedEventAttributes';
}

interface TimerStartedAttrs extends TimerStartedEventAttributes {
  type: 'timerStartedEventAttributes';
}
interface WorkflowExecutionStartedAttrs
  extends WorkflowExecutionStartedEventAttributes {
  type: 'workflowExecutionStartedEventAttributes';
}
interface WorkflowExecutionCompletedAttrs
  extends WorkflowExecutionCompletedEventAttributes {
  type: 'workflowExecutionCompletedEventAttributes';
}
interface WorfklowExecutionFailedAttrs
  extends WorkflowExecutionFailedEventAttributes {
  type: 'workflowExecutionFailedEventAttributes';
}
interface WorkflowExecutionTimedOutAttrs
  extends WorkflowExecutionTimedOutEventAttributes {
  type: 'workflowExecutionTimedOutEventAttributes';
}
interface WorkflowTaskFailedAttrs extends WorkflowTaskFailedEventAttributes {
  type: 'workflowTaskFailedEventAttributes';
}

interface ChildWorkflowExecutionFailedAttrs
  extends ChildWorkflowExecutionFailedEventAttributes {
  type: 'childWorkflowExecutionFailedEventAttributes';
}

type EventAttribute =
  | TaskCompleteAttrs
  | TaskCancelAttrs
  | TaskFailedAttrs
  | TaskScheduledAttrs
  | TaskStartedAttrs
  | TaskTimeoutAttrs
  | ChildTaskCompleteAttrs
  | ChildWorkflowStartedAttrs
  | TaskWorkflowCompletedAttrs
  | TaskWorfklowScheduledAttrs
  | TaskWorkflowStartedAttrs
  | TaskWorfklowTimedOut
  | ExternalWorkflowExecutionSignaledAttrs
  | ChildWorkflowStartExecutionInitiatedAttrs
  | ExternalWorkflowExecutionInitiatedAttrs
  | TimerStartedAttrs
  | WorkflowExecutionStartedAttrs
  | WorkflowExecutionCompletedAttrs
  | WorfklowExecutionFailedAttrs
  | WorkflowExecutionTimedOutAttrs
  | WorkflowTaskFailedAttrs
  | ChildWorkflowExecutionFailedAttrs;

export interface HistoryEventWithId extends HistoryEvent {
  id: string;
  attributes: EventAttribute;
}

export function getEventAttributes(historyEvent: HistoryEvent): EventAttribute {
  const attributeKey = Object.keys(historyEvent).find((key) =>
    key.includes('Attributes'),
  );
  return {
    type: attributeKey as EventAttributeKeys,
    ...historyEvent[attributeKey],
  };
}

export const toEventHistory = (
  response: GetWorkflowExecutionHistoryResponse,
): HistoryEventWithId[] => {
  return response.history.events.map((event) => ({
    ...event,
    id: String(event.eventId),
    attributes: getEventAttributes(event),
  }));
};
