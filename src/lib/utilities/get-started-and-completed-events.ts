import { isWorkflowExecutionCompletedEvent } from './is-event-type';
import { stringifyWithBigInt } from './parse-with-big-int';

type WorkflowInputAndResults = {
  input: string;
  results: string;
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

const isCompletionEvent = (event: WorkflowEvent): event is CompletionEvent => {
  for (const completionType of completedEventTypes) {
    if (event.eventType === completionType) return true;
  }
  return false;
};

const getWorkflowCompletedEvent = (events: WorkflowEvents): CompletionEvent => {
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
  events: WorkflowEvents,
): WorkflowInputAndResults => {
  let input: string;
  let results: string;

  const workflowStartedEvent: WorkflowEvent = events?.find(
    (event: WorkflowEvent) => {
      return !!event.workflowExecutionStartedEventAttributes;
    },
  );

  const workflowCompletedEvent = getWorkflowCompletedEvent(events);

  if (workflowStartedEvent) {
    input = stringifyWithBigInt(
      workflowStartedEvent?.workflowExecutionStartedEventAttributes?.input
        ?.payloads ?? null,
    );
  }

  if (workflowCompletedEvent) {
    results = stringifyWithBigInt(getEventResult(workflowCompletedEvent));
  }

  return {
    input,
    results,
  };
};
