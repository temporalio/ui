import { z } from 'zod';

export const ChildWorkflowExecutionFailureInfo = z.object({
  namespace: z.string().optional(),
  workflowExecution: z.any().optional(),
  workflowType: z.any().optional(),
  initiatedEventId: z.string().optional(),
  startedEventId: z.string().optional(),
  retryState: z
    .enum([
      'RETRY_STATE_UNSPECIFIED',
      'RETRY_STATE_IN_PROGRESS',
      'RETRY_STATE_NON_RETRYABLE_FAILURE',
      'RETRY_STATE_TIMEOUT',
      'RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED',
      'RETRY_STATE_RETRY_POLICY_NOT_SET',
      'RETRY_STATE_INTERNAL_SERVER_ERROR',
      'RETRY_STATE_CANCEL_REQUESTED',
    ])
    .optional(),
});
export type ChildWorkflowExecutionFailureInfo = z.infer<
  typeof ChildWorkflowExecutionFailureInfo
>;
