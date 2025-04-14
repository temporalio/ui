import { z } from 'zod';

export const SetWorkerDeploymentRampingVersionResponse = z.object({
  /**
   * This value is returned so that it can be optionally passed to APIs
   *  that write to the Worker Deployment state to ensure that the state
   *  did not change between this API call and a future write.
   */
  conflictToken: z
    .string()
    .describe(
      'This value is returned so that it can be optionally passed to APIs\n that write to the Worker Deployment state to ensure that the state\n did not change between this API call and a future write.',
    )
    .optional(),
  /**
   * The version that was ramping before executing this operation, in the form
   *  "<deployment_name>.<build_id>". Can also be the `__unversioned__` special value.
   */
  previousVersion: z
    .string()
    .describe(
      'The version that was ramping before executing this operation, in the form\n "<deployment_name>.<build_id>". Can also be the `__unversioned__` special value.',
    )
    .optional(),
  /**The ramping version percentage before executing this operation.*/
  previousPercentage: z
    .number()
    .describe('The ramping version percentage before executing this operation.')
    .optional(),
});
export type SetWorkerDeploymentRampingVersionResponse = z.infer<
  typeof SetWorkerDeploymentRampingVersionResponse
>;
