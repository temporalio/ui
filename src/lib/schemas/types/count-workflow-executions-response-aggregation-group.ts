import { z } from 'zod';

export const CountWorkflowExecutionsResponse_AggregationGroup = z.object({
  groupValues: z.array(z.any()).optional(),
  count: z.string().optional(),
});
export type CountWorkflowExecutionsResponse_AggregationGroup = z.infer<
  typeof CountWorkflowExecutionsResponse_AggregationGroup
>;
