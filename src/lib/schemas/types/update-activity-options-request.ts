import { z } from 'zod';

export const UpdateActivityOptionsRequest = z.object({
  /**Namespace of the workflow which scheduled this activity*/
  namespace: z
    .string()
    .describe('Namespace of the workflow which scheduled this activity')
    .optional(),
  /**Execution info of the workflow which scheduled this activity*/
  execution: z
    .any()
    .describe('Execution info of the workflow which scheduled this activity')
    .optional(),
  /**The identity of the client who initiated this request*/
  identity: z
    .string()
    .describe('The identity of the client who initiated this request')
    .optional(),
  /**Activity options. Partial updates are accepted and controlled by update_mask*/
  activityOptions: z
    .any()
    .describe(
      'Activity options. Partial updates are accepted and controlled by update_mask',
    )
    .optional(),
  /**Controls which fields from `activity_options` will be applied*/
  updateMask: z
    .string()
    .describe('Controls which fields from `activity_options` will be applied')
    .optional(),
  /**Only activity with this ID will be updated.*/
  id: z
    .string()
    .describe('Only activity with this ID will be updated.')
    .optional(),
  /**Update all running activities of this type.*/
  type: z
    .string()
    .describe('Update all running activities of this type.')
    .optional(),
});
export type UpdateActivityOptionsRequest = z.infer<
  typeof UpdateActivityOptionsRequest
>;
