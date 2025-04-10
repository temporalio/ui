import { z } from 'zod';

export const RespondActivityTaskCompletedRequest = z.object({
  /**The task token as received in `PollActivityTaskQueueResponse`*/
  taskToken: z
    .string()
    .describe('The task token as received in `PollActivityTaskQueueResponse`')
    .optional(),
  /**The result of successfully executing the activity*/
  result: z
    .any()
    .describe('The result of successfully executing the activity')
    .optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
  namespace: z.string().optional(),
  /**
   * Version info of the worker who processed this task. This message's `build_id` field should
   *  always be set by SDKs. Workers opting into versioning will also set the `use_versioning`
   *  field to true. See message docstrings for more.
   *  Deprecated. Use `deployment` instead.
   */
  workerVersion: z
    .any()
    .describe(
      "Version info of the worker who processed this task. This message's `build_id` field should\n always be set by SDKs. Workers opting into versioning will also set the `use_versioning`\n field to true. See message docstrings for more.\n Deprecated. Use `deployment` instead.",
    )
    .optional(),
  /**
   * Deployment info of the worker that completed this task. Must be present if user has set
   *  `WorkerDeploymentOptions` regardless of versioning being enabled or not.
   *  Deprecated. Replaced with `deployment_options`.
   */
  deployment: z
    .any()
    .describe(
      'Deployment info of the worker that completed this task. Must be present if user has set\n `WorkerDeploymentOptions` regardless of versioning being enabled or not.\n Deprecated. Replaced with `deployment_options`.',
    )
    .optional(),
  /**Worker deployment options that user has set in the worker.*/
  deploymentOptions: z
    .any()
    .describe('Worker deployment options that user has set in the worker.')
    .optional(),
});
export type RespondActivityTaskCompletedRequest = z.infer<
  typeof RespondActivityTaskCompletedRequest
>;
