import { z } from 'zod';

export const QueryRejected = z.object({
  status: z
    .enum([
      'WORKFLOW_EXECUTION_STATUS_UNSPECIFIED',
      'WORKFLOW_EXECUTION_STATUS_RUNNING',
      'WORKFLOW_EXECUTION_STATUS_COMPLETED',
      'WORKFLOW_EXECUTION_STATUS_FAILED',
      'WORKFLOW_EXECUTION_STATUS_CANCELED',
      'WORKFLOW_EXECUTION_STATUS_TERMINATED',
      'WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW',
      'WORKFLOW_EXECUTION_STATUS_TIMED_OUT',
    ])
    .optional(),
});
export type QueryRejected = z.infer<typeof QueryRejected>;
