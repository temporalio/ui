import { z } from 'zod';

/**How retries ought to be handled, usable by both workflows and activities*/
export const RetryPolicy = z
  .object({
    /**Interval of the first retry. If retryBackoffCoefficient is 1.0 then it is used for all retries.*/
    initialInterval: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe(
        'Interval of the first retry. If retryBackoffCoefficient is 1.0 then it is used for all retries.',
      )
      .optional(),
    /**
     * Coefficient used to calculate the next retry interval.
     *  The next retry interval is previous interval multiplied by the coefficient.
     *  Must be 1 or larger.
     */
    backoffCoefficient: z
      .number()
      .describe(
        'Coefficient used to calculate the next retry interval.\n The next retry interval is previous interval multiplied by the coefficient.\n Must be 1 or larger.',
      )
      .optional(),
    /**
     * Maximum interval between retries. Exponential backoff leads to interval increase.
     *  This value is the cap of the increase. Default is 100x of the initial interval.
     */
    maximumInterval: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe(
        'Maximum interval between retries. Exponential backoff leads to interval increase.\n This value is the cap of the increase. Default is 100x of the initial interval.',
      )
      .optional(),
    /**
     * Maximum number of attempts. When exceeded the retries stop even if not expired yet.
     *  1 disables retries. 0 means unlimited (up to the timeouts)
     */
    maximumAttempts: z
      .number()
      .int()
      .describe(
        'Maximum number of attempts. When exceeded the retries stop even if not expired yet.\n 1 disables retries. 0 means unlimited (up to the timeouts)',
      )
      .optional(),
    /**
     * Non-Retryable errors types. Will stop retrying if the error type matches this list. Note that
     *  this is not a substring match, the error *type* (not message) must match exactly.
     */
    nonRetryableErrorTypes: z
      .array(z.string())
      .describe(
        'Non-Retryable errors types. Will stop retrying if the error type matches this list. Note that\n this is not a substring match, the error *type* (not message) must match exactly.',
      )
      .optional(),
  })
  .describe(
    'How retries ought to be handled, usable by both workflows and activities',
  );
export type RetryPolicy = z.infer<typeof RetryPolicy>;
