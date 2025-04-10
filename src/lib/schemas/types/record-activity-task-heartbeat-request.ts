import { z } from 'zod';

export const RecordActivityTaskHeartbeatRequest = z.object({
  /**The task token as received in `PollActivityTaskQueueResponse`*/
  taskToken: z
    .string()
    .describe('The task token as received in `PollActivityTaskQueueResponse`')
    .optional(),
  /**Arbitrary data, of which the most recent call is kept, to store for this activity*/
  details: z
    .any()
    .describe(
      'Arbitrary data, of which the most recent call is kept, to store for this activity',
    )
    .optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
  namespace: z.string().optional(),
});
export type RecordActivityTaskHeartbeatRequest = z.infer<
  typeof RecordActivityTaskHeartbeatRequest
>;
