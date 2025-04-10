import { z } from 'zod';

export const RespondActivityTaskFailedByIdRequest = z.object({
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
  /**Id of the activity to fail*/
  activityId: z.string().describe('Id of the activity to fail').optional(),
  /**Detailed failure information*/
  failure: z.any().describe('Detailed failure information').optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
  /**Additional details to be stored as last activity heartbeat*/
  lastHeartbeatDetails: z
    .any()
    .describe('Additional details to be stored as last activity heartbeat')
    .optional(),
});
export type RespondActivityTaskFailedByIdRequest = z.infer<
  typeof RespondActivityTaskFailedByIdRequest
>;
