import type { GetWorkflowExecutionHistoryResponse } from '$types';
import { convertPayloadToJson as toJson } from './decode-payload';

type WorkflowEvents = {
  input: string;
  result: string;
};

export const getWorkflowStartedAndCompletedEvents = (
  events: GetWorkflowExecutionHistoryResponse,
): WorkflowEvents => {
  const workflowStartedEvent: WorkflowExecutionStartedEvent =
    events?.history?.events?.find((event) => {
      return !!event.workflowExecutionStartedEventAttributes;
    });

  const workflowCompletedEvent: WorkflowExecutionCompletedEvent =
    events?.history?.events?.find((event) => {
      return !!event.workflowExecutionCompletedEventAttributes;
    });

  const input = toJson(workflowStartedEvent);
  const result = toJson(workflowCompletedEvent);

  return {
    input,
    result,
  };
};
