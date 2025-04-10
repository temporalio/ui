import { z } from 'zod';

export const RespondActivityTaskCompletedByIdRequest = z.object({
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
  /**Id of the activity to complete*/
  activityId: z.string().describe('Id of the activity to complete').optional(),
  /**The serialized result of activity execution*/
  result: z
    .any()
    .describe('The serialized result of activity execution')
    .optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
});
export type RespondActivityTaskCompletedByIdRequest = z.infer<
  typeof RespondActivityTaskCompletedByIdRequest
>;
