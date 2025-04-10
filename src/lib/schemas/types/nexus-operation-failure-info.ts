import { z } from 'zod';

export const NexusOperationFailureInfo = z.object({
  /**The NexusOperationScheduled event ID.*/
  scheduledEventId: z
    .string()
    .describe('The NexusOperationScheduled event ID.')
    .optional(),
  /**Endpoint name.*/
  endpoint: z.string().describe('Endpoint name.').optional(),
  /**Service name.*/
  service: z.string().describe('Service name.').optional(),
  /**Operation name.*/
  operation: z.string().describe('Operation name.').optional(),
  /**
   * Operation ID - may be empty if the operation completed synchronously.
   *
   *  Deprecated: Renamed to operation_token.
   */
  operationId: z
    .string()
    .describe(
      'Operation ID - may be empty if the operation completed synchronously.\n\n Deprecated: Renamed to operation_token.',
    )
    .optional(),
  /**Operation token - may be empty if the operation completed synchronously.*/
  operationToken: z
    .string()
    .describe(
      'Operation token - may be empty if the operation completed synchronously.',
    )
    .optional(),
});
export type NexusOperationFailureInfo = z.infer<
  typeof NexusOperationFailureInfo
>;
