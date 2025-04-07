import { z } from 'zod';

export const WorkflowExecutionUpdateCompletedEventAttributes = z.object({
  /**The metadata about this update.*/
  meta: z.any().describe('The metadata about this update.').optional(),
  /**The event ID indicating the acceptance of this update.*/
  acceptedEventId: z
    .string()
    .describe('The event ID indicating the acceptance of this update.')
    .optional(),
  /**The outcome of executing the workflow update function.*/
  outcome: z
    .any()
    .describe('The outcome of executing the workflow update function.')
    .optional(),
});
export type WorkflowExecutionUpdateCompletedEventAttributes = z.infer<
  typeof WorkflowExecutionUpdateCompletedEventAttributes
>;
