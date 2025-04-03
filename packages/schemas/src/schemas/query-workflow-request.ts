import { z } from 'zod';

export const QueryWorkflowRequest = z.object({
  namespace: z.string().optional(),
  execution: z.any().optional(),
  query: z.any().optional(),
  /**
   * QueryRejectCondition can used to reject the query if workflow state does not satisfy condition.
   *  Default: QUERY_REJECT_CONDITION_NONE.
   */
  queryRejectCondition: z
    .enum([
      'QUERY_REJECT_CONDITION_UNSPECIFIED',
      'QUERY_REJECT_CONDITION_NONE',
      'QUERY_REJECT_CONDITION_NOT_OPEN',
      'QUERY_REJECT_CONDITION_NOT_COMPLETED_CLEANLY',
    ])
    .describe(
      'QueryRejectCondition can used to reject the query if workflow state does not satisfy condition.\n Default: QUERY_REJECT_CONDITION_NONE.',
    )
    .optional(),
});
export type QueryWorkflowRequest = z.infer<typeof QueryWorkflowRequest>;
