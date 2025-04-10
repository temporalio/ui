import { z } from 'zod';

export const NexusHandlerFailureInfo = z.object({
  /**
   * The Nexus error type as defined in the spec:
   *  https://github.com/nexus-rpc/api/blob/main/SPEC.md#predefined-handler-errors.
   */
  type: z
    .string()
    .describe(
      'The Nexus error type as defined in the spec:\n https://github.com/nexus-rpc/api/blob/main/SPEC.md#predefined-handler-errors.',
    )
    .optional(),
  /**Retry behavior, defaults to the retry behavior of the error type as defined in the spec.*/
  retryBehavior: z
    .enum([
      'NEXUS_HANDLER_ERROR_RETRY_BEHAVIOR_UNSPECIFIED',
      'NEXUS_HANDLER_ERROR_RETRY_BEHAVIOR_RETRYABLE',
      'NEXUS_HANDLER_ERROR_RETRY_BEHAVIOR_NON_RETRYABLE',
    ])
    .describe(
      'Retry behavior, defaults to the retry behavior of the error type as defined in the spec.',
    )
    .optional(),
});
export type NexusHandlerFailureInfo = z.infer<typeof NexusHandlerFailureInfo>;
