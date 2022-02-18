type WorkflowEvents = {
  input: string;
  result: string;
};

export const getWorkflowStartedAndCompletedEvents = async (
  events: HistoryEventWithId[] | PromiseLike<HistoryEventWithId[]>,
): Promise<WorkflowEvents> => {
  events = await events;

  const workflowStartedEvent: HistoryEventWithId = events?.find((event) => {
    return !!event.workflowExecutionStartedEventAttributes;
  });

  const workflowCompletedEvent: HistoryEventWithId = events?.find((event) => {
    return !!event.workflowExecutionCompletedEventAttributes;
  });

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
