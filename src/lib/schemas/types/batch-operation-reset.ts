import { z } from 'zod';

/**
 * BatchOperationReset sends reset requests to batch workflows.
 *  Keep the parameter in sync with temporal.api.workflowservice.v1.ResetWorkflowExecutionRequest.
 */
export const BatchOperationReset = z
  .object({
    /**The identity of the worker/client.*/
    identity: z
      .string()
      .describe('The identity of the worker/client.')
      .optional(),
    /**Describes what to reset to and how. If set, `reset_type` and `reset_reapply_type` are ignored.*/
    options: z
      .any()
      .describe(
        'Describes what to reset to and how. If set, `reset_type` and `reset_reapply_type` are ignored.',
      )
      .optional(),
    /**Reset type (deprecated, use `options`).*/
    resetType: z
      .enum([
        'RESET_TYPE_UNSPECIFIED',
        'RESET_TYPE_FIRST_WORKFLOW_TASK',
        'RESET_TYPE_LAST_WORKFLOW_TASK',
      ])
      .describe('Reset type (deprecated, use `options`).')
      .optional(),
    /**History event reapply options (deprecated, use `options`).*/
    resetReapplyType: z
      .enum([
        'RESET_REAPPLY_TYPE_UNSPECIFIED',
        'RESET_REAPPLY_TYPE_SIGNAL',
        'RESET_REAPPLY_TYPE_NONE',
        'RESET_REAPPLY_TYPE_ALL_ELIGIBLE',
      ])
      .describe('History event reapply options (deprecated, use `options`).')
      .optional(),
  })
  .describe(
    'BatchOperationReset sends reset requests to batch workflows.\n Keep the parameter in sync with temporal.api.workflowservice.v1.ResetWorkflowExecutionRequest.',
  );
export type BatchOperationReset = z.infer<typeof BatchOperationReset>;
