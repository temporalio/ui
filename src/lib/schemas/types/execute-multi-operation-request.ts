import { z } from 'zod';

export const ExecuteMultiOperationRequest = z.object({
  namespace: z.string().optional(),
  /**
   * List of operations to execute within a single workflow.
   *
   *  Preconditions:
   *  - The list of operations must not be empty.
   *  - The workflow ids must match across operations.
   *  - The only valid list of operations at this time is [StartWorkflow, UpdateWorkflow], in this order.
   *
   *  Note that additional operation-specific restrictions have to be considered.
   */
  operations: z
    .array(z.any())
    .describe(
      'List of operations to execute within a single workflow.\n\n Preconditions:\n - The list of operations must not be empty.\n - The workflow ids must match across operations.\n - The only valid list of operations at this time is [StartWorkflow, UpdateWorkflow], in this order.\n\n Note that additional operation-specific restrictions have to be considered.',
    )
    .optional(),
});
export type ExecuteMultiOperationRequest = z.infer<
  typeof ExecuteMultiOperationRequest
>;
