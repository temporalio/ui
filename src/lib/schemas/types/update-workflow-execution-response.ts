import { z } from 'zod';

export const UpdateWorkflowExecutionResponse = z.object({
  /**Enough information for subsequent poll calls if needed. Never null.*/
  updateRef: z
    .any()
    .describe(
      'Enough information for subsequent poll calls if needed. Never null.',
    )
    .optional(),
  /**
   * The outcome of the Update if and only if the Workflow Update
   *  has completed. If this response is being returned before the Update has
   *  completed then this field will not be set.
   */
  outcome: z
    .any()
    .describe(
      'The outcome of the Update if and only if the Workflow Update\n has completed. If this response is being returned before the Update has\n completed then this field will not be set.',
    )
    .optional(),
  /**
   * The most advanced lifecycle stage that the Update is known to have
   *  reached, where lifecycle stages are ordered
   *  UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_UNSPECIFIED <
   *  UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ADMITTED <
   *  UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ACCEPTED <
   *  UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_COMPLETED.
   *  UNSPECIFIED will be returned if and only if the server's maximum wait
   *  time was reached before the Update reached the stage specified in the
   *  request WaitPolicy, and before the context deadline expired; clients may
   *  may then retry the call as needed.
   */
  stage: z
    .enum([
      'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_UNSPECIFIED',
      'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ADMITTED',
      'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ACCEPTED',
      'UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_COMPLETED',
    ])
    .describe(
      "The most advanced lifecycle stage that the Update is known to have\n reached, where lifecycle stages are ordered\n UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_UNSPECIFIED <\n UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ADMITTED <\n UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_ACCEPTED <\n UPDATE_WORKFLOW_EXECUTION_LIFECYCLE_STAGE_COMPLETED.\n UNSPECIFIED will be returned if and only if the server's maximum wait\n time was reached before the Update reached the stage specified in the\n request WaitPolicy, and before the context deadline expired; clients may\n may then retry the call as needed.",
    )
    .optional(),
});
export type UpdateWorkflowExecutionResponse = z.infer<
  typeof UpdateWorkflowExecutionResponse
>;
