import { z } from 'zod';

export const ListBatchOperationsResponse = z.object({
  /**BatchOperationInfo contains the basic info about batch operation*/
  operationInfo: z
    .array(z.any())
    .describe(
      'BatchOperationInfo contains the basic info about batch operation',
    )
    .optional(),
  nextPageToken: z.string().optional(),
});
export type ListBatchOperationsResponse = z.infer<
  typeof ListBatchOperationsResponse
>;
