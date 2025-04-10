import { z } from 'zod';

export const PendingChildExecutionInfo = z.object({
  workflowId: z.string().optional(),
  runId: z.string().optional(),
  workflowTypeName: z.string().optional(),
  initiatedId: z.string().optional(),
  /**Default: PARENT_CLOSE_POLICY_TERMINATE.*/
  parentClosePolicy: z
    .enum([
      'PARENT_CLOSE_POLICY_UNSPECIFIED',
      'PARENT_CLOSE_POLICY_TERMINATE',
      'PARENT_CLOSE_POLICY_ABANDON',
      'PARENT_CLOSE_POLICY_REQUEST_CANCEL',
    ])
    .describe('Default: PARENT_CLOSE_POLICY_TERMINATE.')
    .optional(),
});
export type PendingChildExecutionInfo = z.infer<
  typeof PendingChildExecutionInfo
>;
