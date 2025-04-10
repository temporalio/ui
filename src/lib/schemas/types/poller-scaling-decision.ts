import { z } from 'zod';

/**
 * Attached to task responses to give hints to the SDK about how it may adjust its number of
 *  pollers.
 */
export const PollerScalingDecision = z
  .object({
    /**
     * How many poll requests to suggest should be added or removed, if any. As of now, server only
     *  scales up or down by 1. However, SDKs should allow for other values (while staying within
     *  defined min/max).
     *
     *  The SDK is free to ignore this suggestion, EX: making more polls would not make sense because
     *  all slots are already occupied.
     */
    pollRequestDeltaSuggestion: z
      .number()
      .int()
      .describe(
        'How many poll requests to suggest should be added or removed, if any. As of now, server only\n scales up or down by 1. However, SDKs should allow for other values (while staying within\n defined min/max).\n\n The SDK is free to ignore this suggestion, EX: making more polls would not make sense because\n all slots are already occupied.',
      )
      .optional(),
  })
  .describe(
    'Attached to task responses to give hints to the SDK about how it may adjust its number of\n pollers.',
  );
export type PollerScalingDecision = z.infer<typeof PollerScalingDecision>;
