import { z } from 'zod';

export const RecordActivityTaskHeartbeatByIdRequest = z.object({
  /**Namespace of the workflow which scheduled this activity*/
  namespace: z
    .string()
    .describe('Namespace of the workflow which scheduled this activity')
    .optional(),
  /**Id of the workflow which scheduled this activity*/
  workflowId: z
    .string()
    .describe('Id of the workflow which scheduled this activity')
    .optional(),
  /**Run Id of the workflow which scheduled this activity*/
  runId: z
    .string()
    .describe('Run Id of the workflow which scheduled this activity')
    .optional(),
  /**Id of the activity we're heartbeating*/
  activityId: z
    .string()
    .describe("Id of the activity we're heartbeating")
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
});
export type RecordActivityTaskHeartbeatByIdRequest = z.infer<
  typeof RecordActivityTaskHeartbeatByIdRequest
>;
