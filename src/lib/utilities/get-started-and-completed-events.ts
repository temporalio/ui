import type { GetWorkflowExecutionHistoryResponse } from '$types/temporal/api/workflowservice/v1/request_response';
import { convertPayloadToJson } from './decode-payload';

export const getWorkflowStartedAndCompletedEvents = (
  events: GetWorkflowExecutionHistoryResponse,
) => {
  let workflowStartedEvent: WorkflowExecutionStartedEvent = events.history.events.find(
    (event) => {
      return !!event.workflowExecutionStartedEventAttributes;
    },
  );

  let workflowCompletedEvent: WorkflowExecutionCompletedEvent = events.history.events.find(
    (event) => {
      return !!event.workflowTaskCompletedEventAttributes;
    },
  );

  const input =
    workflowStartedEvent && convertPayloadToJson(workflowStartedEvent);
  const result =
    workflowCompletedEvent && convertPayloadToJson(workflowCompletedEvent);

  return {
    input,
    result,
  };
};
