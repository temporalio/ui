import { convertPayloadToJson as toJson } from './decode-payload';

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

  const input = toJson(workflowStartedEvent);
  const result = toJson(workflowCompletedEvent);

  return {
    input,
    result,
  };
};
