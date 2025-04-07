import { z } from 'zod';

export const CountWorkflowExecutionsResponse = z.object({
  /**
   * If `query` is not grouping by any field, the count is an approximate number
   *  of workflows that matches the query.
   *  If `query` is grouping by a field, the count is simply the sum of the counts
   *  of the groups returned in the response. This number can be smaller than the
   *  total number of workflows matching the query.
   */
  count: z
    .string()
    .describe(
      'If `query` is not grouping by any field, the count is an approximate number\n of workflows that matches the query.\n If `query` is grouping by a field, the count is simply the sum of the counts\n of the groups returned in the response. This number can be smaller than the\n total number of workflows matching the query.',
    )
    .optional(),
  /**
   * `groups` contains the groups if the request is grouping by a field.
   *  The list might not be complete, and the counts of each group is approximate.
   */
  groups: z
    .array(z.any())
    .describe(
      '`groups` contains the groups if the request is grouping by a field.\n The list might not be complete, and the counts of each group is approximate.',
    )
    .optional(),
});
export type CountWorkflowExecutionsResponse = z.infer<
  typeof CountWorkflowExecutionsResponse
>;
