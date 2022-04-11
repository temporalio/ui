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

const getWorkflowCompletedEvent = (
  events: HistoryEventWithId[],
): CompletionEvent => {
  for (const event of events) {
    for (const completionType of completedEventTypes) {
      if (event.eventType === completionType) return event;
    }
  }
};

const getEventResult = (event: CompletionEvent) => {
  const payloads = event.attributes?.result?.payloads;

  if (payloads) return payloads;

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
