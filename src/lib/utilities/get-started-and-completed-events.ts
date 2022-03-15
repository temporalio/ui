type WorkflowEvents = {
  input: string;
  result: string;
};

export const getWorkflowStartedAndCompletedEvents = (
  events: HistoryEventWithId[],
): WorkflowEvents => {
  let input: string;
  let result: string;

  const workflowStartedEvent: HistoryEventWithId = events?.find((event) => {
    return !!event.workflowExecutionStartedEventAttributes;
  });

  const workflowCompletedEvent: HistoryEventWithId = events?.find((event) => {
    return !!event.workflowExecutionCompletedEventAttributes;
  });

  if (workflowStartedEvent) {
    input = JSON.stringify(
      workflowStartedEvent?.workflowExecutionStartedEventAttributes?.input
        ?.payloads,
    );
  }

  if (workflowCompletedEvent) {
    result = JSON.stringify(
      workflowCompletedEvent?.workflowExecutionCompletedEventAttributes?.result
        ?.payloads,
    );
  }

  return {
    input,
    result,
  };
};
