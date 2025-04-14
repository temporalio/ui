import { z } from 'zod';

export const Failure = z.object({
  message: z.string().optional(),
  /**
   * The source this Failure originated in, e.g. TypeScriptSDK / JavaSDK
   *  In some SDKs this is used to rehydrate the stack trace into an exception object.
   */
  source: z
    .string()
    .describe(
      'The source this Failure originated in, e.g. TypeScriptSDK / JavaSDK\n In some SDKs this is used to rehydrate the stack trace into an exception object.',
    )
    .optional(),
  stackTrace: z.string().optional(),
  /**
   * Alternative way to supply `message` and `stack_trace` and possibly other attributes, used for encryption of
   *  errors originating in user code which might contain sensitive information.
   *  The `encoded_attributes` Payload could represent any serializable object, e.g. JSON object or a `Failure` proto
   *  message.
   *
   *  SDK authors:
   *  - The SDK should provide a default `encodeFailureAttributes` and `decodeFailureAttributes` implementation that:
   *    - Uses a JSON object to represent `{ message, stack_trace }`.
   *    - Overwrites the original message with "Encoded failure" to indicate that more information could be extracted.
   *    - Overwrites the original stack_trace with an empty string.
   *    - The resulting JSON object is converted to Payload using the default PayloadConverter and should be processed
   *      by the user-provided PayloadCodec
   *
   *  - If there's demand, we could allow overriding the default SDK implementation to encode other opaque Failure attributes.
   */
  encodedAttributes: z
    .any()
    .describe(
      'Alternative way to supply `message` and `stack_trace` and possibly other attributes, used for encryption of\n errors originating in user code which might contain sensitive information.\n The `encoded_attributes` Payload could represent any serializable object, e.g. JSON object or a `Failure` proto\n message.\n\n SDK authors:\n - The SDK should provide a default `encodeFailureAttributes` and `decodeFailureAttributes` implementation that:\n   - Uses a JSON object to represent `{ message, stack_trace }`.\n   - Overwrites the original message with "Encoded failure" to indicate that more information could be extracted.\n   - Overwrites the original stack_trace with an empty string.\n   - The resulting JSON object is converted to Payload using the default PayloadConverter and should be processed\n     by the user-provided PayloadCodec\n\n - If there\'s demand, we could allow overriding the default SDK implementation to encode other opaque Failure attributes.',
    )
    .optional(),
  cause: z.any().optional(),
  applicationFailureInfo: z.any().optional(),
  timeoutFailureInfo: z.any().optional(),
  canceledFailureInfo: z.any().optional(),
  terminatedFailureInfo: z.any().optional(),
  serverFailureInfo: z.any().optional(),
  resetWorkflowFailureInfo: z.any().optional(),
  activityFailureInfo: z.any().optional(),
  childWorkflowExecutionFailureInfo: z.any().optional(),
  nexusOperationExecutionFailureInfo: z.any().optional(),
  nexusHandlerFailureInfo: z.any().optional(),
});
export type Failure = z.infer<typeof Failure>;
