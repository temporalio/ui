import { z } from 'zod';

export const RespondActivityTaskCanceledByIdRequest = z.object({
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
  /**Id of the activity to confirm is cancelled*/
  activityId: z
    .string()
    .describe('Id of the activity to confirm is cancelled')
    .optional(),
  /**Serialized additional information to attach to the cancellation*/
  details: z
    .any()
    .describe('Serialized additional information to attach to the cancellation')
    .optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
});
export type RespondActivityTaskCanceledByIdRequest = z.infer<
  typeof RespondActivityTaskCanceledByIdRequest
>;
