import { z } from 'zod';

/**
 * (-- api-linter: core::0134=disabled
 *      aip.dev/not-precedent: Update RPCs don't follow Google API format. --)
 */
export const UpdateWorkflowExecutionRequest = z
  .object({
    /**The namespace name of the target Workflow.*/
    namespace: z
      .string()
      .describe('The namespace name of the target Workflow.')
      .optional(),
    /**
     * The target Workflow Id and (optionally) a specific Run Id thereof.
     *  (-- api-linter: core::0203::optional=disabled
     *      aip.dev/not-precedent: false positive triggered by the word "optional" --)
     */
    workflowExecution: z
      .any()
      .describe(
        'The target Workflow Id and (optionally) a specific Run Id thereof.\n (-- api-linter: core::0203::optional=disabled\n     aip.dev/not-precedent: false positive triggered by the word "optional" --)',
      )
      .optional(),
    /**
     * If set, this call will error if the most recent (if no Run Id is set on
     *  `workflow_execution`), or specified (if it is) Workflow Execution is not
     *  part of the same execution chain as this Id.
     */
    firstExecutionRunId: z
      .string()
      .describe(
        'If set, this call will error if the most recent (if no Run Id is set on\n `workflow_execution`), or specified (if it is) Workflow Execution is not\n part of the same execution chain as this Id.',
      )
      .optional(),
    /**
     * Specifies client's intent to wait for Update results.
     *  NOTE: This field works together with API call timeout which is limited by
     *  server timeout (maximum wait time). If server timeout is expired before
     *  user specified timeout, API call returns even if specified stage is not reached.
     *  Actual reached stage will be included in the response.
     */
    waitPolicy: z
      .any()
      .describe(
        "Specifies client's intent to wait for Update results.\n NOTE: This field works together with API call timeout which is limited by\n server timeout (maximum wait time). If server timeout is expired before\n user specified timeout, API call returns even if specified stage is not reached.\n Actual reached stage will be included in the response.",
      )
      .optional(),
    /**
     * The request information that will be delivered all the way down to the
     *  Workflow Execution.
     */
    request: z
      .any()
      .describe(
        'The request information that will be delivered all the way down to the\n Workflow Execution.',
      )
      .optional(),
  })
  .describe(
    "(-- api-linter: core::0134=disabled\n     aip.dev/not-precedent: Update RPCs don't follow Google API format. --)",
  );
export type UpdateWorkflowExecutionRequest = z.infer<
  typeof UpdateWorkflowExecutionRequest
>;
