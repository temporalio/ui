import {
  SignalWithStartWorkflowExecutionRequestSchema,
  SignalWithStartWorkflowExecutionResponseSchema,
} from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';

export const REQUEST_MESSAGE_TYPE =
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest';
export const RESPONSE_MESSAGE_TYPE =
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse';

export const requestSchema = SignalWithStartWorkflowExecutionRequestSchema;
export const responseSchema = SignalWithStartWorkflowExecutionResponseSchema;
