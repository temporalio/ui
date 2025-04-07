import { z } from 'zod';

/**Specifies client's intent to wait for Update results.*/
export const WaitPolicy = z
  .object({
    /**
     * Indicates the Update lifecycle stage that the Update must reach before
     *  API call is returned.
     *  NOTE: This field works together with API call timeout which is limited by
     *  server timeout (maximum wait time). If server timeout is expired before
     *  user specified timeout, API call returns even if specified stage is not reached.
     */
    lifecycleStage: z
      .enum([
        'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_UNSPECIFIED',
        'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ADMITTED',
        'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ACCEPTED',
        'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_COMPLETED',
      ])
      .describe(
        'Indicates the Update lifecycle stage that the Update must reach before\n API call is returned.\n NOTE: This field works together with API call timeout which is limited by\n server timeout (maximum wait time). If server timeout is expired before\n user specified timeout, API call returns even if specified stage is not reached.',
      )
      .optional(),
  })
  .describe("Specifies client's intent to wait for Update results.");
export type WaitPolicy = z.infer<typeof WaitPolicy>;
