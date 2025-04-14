import { z } from 'zod';

export const UnpauseActivityRequest = z.object({
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
  /**Only the activity with this ID will be unpaused.*/
  id: z
    .string()
    .describe('Only the activity with this ID will be unpaused.')
    .optional(),
  /**Unpause all running activities with of this type.*/
  type: z
    .string()
    .describe('Unpause all running activities with of this type.')
    .optional(),
  /**Unpause all running activities.*/
  unpauseAll: z
    .boolean()
    .describe('Unpause all running activities.')
    .optional(),
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
  /**If set, the activity will start at a random time within the specified jitter duration.*/
  jitter: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'If set, the activity will start at a random time within the specified jitter duration.',
    )
    .optional(),
});
export type UnpauseActivityRequest = z.infer<typeof UnpauseActivityRequest>;
