import { isWorkflowExecutionCompletedEvent } from './is-event-type';

type WorkflowEvents = {
  input: string;
  result: string;
};

type CompletionEvent =
  | WorkflowExecutionFailedEvent
  | WorkflowExecutionCompletedEvent
  | WorkflowExecutionContinuedAsNewEvent
  | WorkflowExecutionTimedOutEvent
  | WorkflowExecutionCanceledEvent
  | WorkflowExecutionTerminatedEvent;

const completedEventTypes = [
  'WorkflowExecutionFailed',
  'WorkflowExecutionCompleted',
  'WorkflowExecutionContinuedAsNew',
  'WorkflowExecutionTimedOut',
  'WorkflowExecutionCanceled',
  'WorkflowExecutionTerminated',
] as const;

const isCompletionEvent = (
  event: HistoryEventWithId,
): event is CompletionEvent => {
  for (const completionType of completedEventTypes) {
    if (event.eventType === completionType) return true;
  }
  return false;
};

const getWorkflowCompletedEvent = (
  events: HistoryEventWithId[],
): CompletionEvent => {
  for (const event of events) {
    if (isCompletionEvent(event)) return event;
  }
};

const getEventResult = (event: CompletionEvent) => {
  if (isWorkflowExecutionCompletedEvent(event)) {
    if (event.attributes.result === null) return null;
    return event.attributes.result.payloads;
  }

  return event.attributes;
};

export const getWorkflowStartedAndCompletedEvents = (
  events: HistoryEventWithId[],
): WorkflowEvents => {
  let input: string;
  let result: string;

  const workflowStartedEvent: HistoryEventWithId = events?.find((event) => {
    return !!event.workflowExecutionStartedEventAttributes;
  });

  const workflowCompletedEvent = getWorkflowCompletedEvent(events);

  if (workflowStartedEvent) {
    input = JSON.stringify(
      workflowStartedEvent?.workflowExecutionStartedEventAttributes?.input
        ?.payloads,
    );
  }

  if (workflowCompletedEvent) {
    result = JSON.stringify(getEventResult(workflowCompletedEvent));
  }

  return {
    input,
    result,
  };
};
