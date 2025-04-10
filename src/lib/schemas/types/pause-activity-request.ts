import { z } from 'zod';

export const PauseActivityRequest = z.object({
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
  /**Only the activity with this ID will be paused.*/
  id: z
    .string()
    .describe('Only the activity with this ID will be paused.')
    .optional(),
  /**Pause all running activities of this type.*/
  type: z
    .string()
    .describe('Pause all running activities of this type.')
    .optional(),
});
export type PauseActivityRequest = z.infer<typeof PauseActivityRequest>;
