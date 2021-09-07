import type { GetWorkflowExecutionHistoryResponse } from '$types';
import { convertPayloadToJson } from './decode-payload';

export const getWorkflowStartedAndCompletedEvents = (
  events: GetWorkflowExecutionHistoryResponse,
) => {
  const workflowStartedEvent: WorkflowExecutionStartedEvent =
    events.history.events.find((event) => {
      return !!event.workflowExecutionStartedEventAttributes;
    });

  const workflowCompletedEvent: WorkflowExecutionCompletedEvent =
    events.history.events.find((event) => {
      return !!event.workflowExecutionCompletedEventAttributes;
    });

  const input =
    workflowStartedEvent && convertPayloadToJson(workflowStartedEvent);
  const result =
    workflowCompletedEvent && convertPayloadToJson(workflowCompletedEvent);

  return {
    input,
    result,
  };
};
