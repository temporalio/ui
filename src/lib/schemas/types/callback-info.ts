import { z } from 'zod';

/**CallbackInfo contains the state of an attached workflow callback.*/
export const CallbackInfo = z
  .object({
    /**Information on how this callback should be invoked (e.g. its URL and type).*/
    callback: z
      .any()
      .describe(
        'Information on how this callback should be invoked (e.g. its URL and type).',
      )
      .optional(),
    /**Trigger for this callback.*/
    trigger: z.any().describe('Trigger for this callback.').optional(),
    /**The time when the callback was registered.*/
    registrationTime: z
      .string()
      .datetime({ offset: true })
      .describe('The time when the callback was registered.')
      .optional(),
    state: z
      .enum([
        'CALLBACK_STATE_UNSPECIFIED',
        'CALLBACK_STATE_STANDBY',
        'CALLBACK_STATE_SCHEDULED',
        'CALLBACK_STATE_BACKING_OFF',
        'CALLBACK_STATE_FAILED',
        'CALLBACK_STATE_SUCCEEDED',
        'CALLBACK_STATE_BLOCKED',
      ])
      .optional(),
    /**
     * The number of attempts made to deliver the callback.
     *  This number represents a minimum bound since the attempt is incremented after the callback request completes.
     */
    attempt: z
      .number()
      .int()
      .describe(
        'The number of attempts made to deliver the callback.\n This number represents a minimum bound since the attempt is incremented after the callback request completes.',
      )
      .optional(),
    /**The time when the last attempt completed.*/
    lastAttemptCompleteTime: z
      .string()
      .datetime({ offset: true })
      .describe('The time when the last attempt completed.')
      .optional(),
    /**The last attempt's failure, if any.*/
    lastAttemptFailure: z
      .any()
      .describe("The last attempt's failure, if any.")
      .optional(),
    /**The time when the next attempt is scheduled.*/
    nextAttemptScheduleTime: z
      .string()
      .datetime({ offset: true })
      .describe('The time when the next attempt is scheduled.')
      .optional(),
    /**If the state is BLOCKED, blocked reason provides additional information.*/
    blockedReason: z
      .string()
      .describe(
        'If the state is BLOCKED, blocked reason provides additional information.',
      )
      .optional(),
  })
  .describe(
    'CallbackInfo contains the state of an attached workflow callback.',
  );
export type CallbackInfo = z.infer<typeof CallbackInfo>;
