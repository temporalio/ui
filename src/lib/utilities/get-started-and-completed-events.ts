type WorkflowEvents = {
  input: string;
  result: string;
};

export const getWorkflowStartedAndCompletedEvents = (
  events: HistoryEvent[],
): WorkflowEvents => {
  const workflowStartedEvent: WorkflowExecutionStartedEvent = events?.find(
    (event) => {
      return !!event.workflowExecutionStartedEventAttributes;
    },
  );

  const workflowCompletedEvent: WorkflowExecutionCompletedEvent = events?.find(
    (event) => {
      return !!event.workflowExecutionCompletedEventAttributes;
    },
  );

  // I changed this to be a string to appease the compiler. But I _think_ these should already
  // be decoded through the toEventHistory. This function is currently not being used and the values below
  // needs to be verified.
  return {
    input: JSON.stringify(
      workflowStartedEvent.workflowExecutionStartedEventAttributes?.input
        ?.payloads ?? '',
    ),
    result: JSON.stringify(
      workflowCompletedEvent.workflowExecutionCompletedEventAttributes?.result
        ?.payloads ?? '',
    ),
  };
};
