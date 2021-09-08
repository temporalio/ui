import type {
  WorkflowExecutionStartedEventAttributes,
  WorkflowExecutionCompletedEventAttributes,
} from '$types';
import base64 from 'base-64';

type DecodeEvent = BaseEvent & {
  workflowExecutionStartedEventAttributes?: WorkflowExecutionStartedEventAttributes;
  workflowExecutionCompletedEventAttributes?: WorkflowExecutionCompletedEventAttributes;
};

export const convertPayloadToJson = (event: DecodeEvent): string => {
  if (!event) return;

  if (event.workflowExecutionStartedEventAttributes) {
    const input = event.workflowExecutionStartedEventAttributes.input;
    if (input === null) return 'null';
    if (input) {
      const [data] = input.payloads.map((payload) => payload.data);
      return base64.decode(String(data));
    }
  }

  if (event.workflowExecutionCompletedEventAttributes) {
    const result = event.workflowExecutionCompletedEventAttributes.result;
    if (result === null) return 'null';
    if (result) {
      const [data] = result.payloads.map((payload) => payload.data);
      return base64.decode(String(data));
    }
  }
};
