import { z } from 'zod';

/**BatchOperationUnpauseActivities sends unpause requests to batch workflows.*/
export const BatchOperationUnpauseActivities = z
  .object({
    /**The identity of the worker/client.*/
    identity: z
      .string()
      .describe('The identity of the worker/client.')
      .optional(),
    type: z.string().optional(),
    matchAll: z.boolean().optional(),
    /**Providing this flag will also reset the number of attempts.*/
    resetAttempts: z
      .boolean()
      .describe('Providing this flag will also reset the number of attempts.')
      .optional(),
    /**Providing this flag will also reset the heartbeat details.*/
    resetHeartbeat: z
      .boolean()
      .describe('Providing this flag will also reset the heartbeat details.')
      .optional(),
    /**
     * If set, the activity will start at a random time within the specified jitter
     *  duration, introducing variability to the start time.
     */
    jitter: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe(
        'If set, the activity will start at a random time within the specified jitter\n duration, introducing variability to the start time.',
      )
      .optional(),
  })
  .describe(
    'BatchOperationUnpauseActivities sends unpause requests to batch workflows.',
  );
export type BatchOperationUnpauseActivities = z.infer<
  typeof BatchOperationUnpauseActivities
>;
