import { z } from 'zod';

export const ResetActivityRequest = z.object({
  /**Namespace of the workflow which scheduled this activity.*/
  namespace: z
    .string()
    .describe('Namespace of the workflow which scheduled this activity.')
    .optional(),
  /**Execution info of the workflow which scheduled this activity*/
  execution: z
    .any()
    .describe('Execution info of the workflow which scheduled this activity')
    .optional(),
  /**The identity of the client who initiated this request.*/
  identity: z
    .string()
    .describe('The identity of the client who initiated this request.')
    .optional(),
  /**Only activity with this ID will be reset.*/
  id: z
    .string()
    .describe('Only activity with this ID will be reset.')
    .optional(),
  /**Reset all running activities with of this type.*/
  type: z
    .string()
    .describe('Reset all running activities with of this type.')
    .optional(),
  /**
   * Indicates that activity should reset heartbeat details.
   *  This flag will be applied only to the new instance of the activity.
   */
  resetHeartbeat: z
    .boolean()
    .describe(
      'Indicates that activity should reset heartbeat details.\n This flag will be applied only to the new instance of the activity.',
    )
    .optional(),
  /**if activity is paused, it will remain paused after reset*/
  keepPaused: z
    .boolean()
    .describe('if activity is paused, it will remain paused after reset')
    .optional(),
  /**
   * If set, and activity is in backoff, the activity will start at a random time within the specified jitter duration.
   *  (unless it is paused and keep_paused is set)
   */
  jitter: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'If set, and activity is in backoff, the activity will start at a random time within the specified jitter duration.\n (unless it is paused and keep_paused is set)',
    )
    .optional(),
});
export type ResetActivityRequest = z.infer<typeof ResetActivityRequest>;
