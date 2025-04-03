import { z } from 'zod';

export const ExecuteMultiOperationRequest_Operation = z.object({
  /**
   * Additional restrictions:
   *  - setting `cron_schedule` is invalid
   *  - setting `request_eager_execution` is invalid
   *  - setting `workflow_start_delay` is invalid
   */
  startWorkflow: z
    .any()
    .describe(
      'Additional restrictions:\n - setting `cron_schedule` is invalid\n - setting `request_eager_execution` is invalid\n - setting `workflow_start_delay` is invalid',
    )
    .optional(),
  /**
   * Additional restrictions:
   *  - setting `first_execution_run_id` is invalid
   *  - setting `workflow_execution.run_id` is invalid
   */
  updateWorkflow: z
    .any()
    .describe(
      'Additional restrictions:\n - setting `first_execution_run_id` is invalid\n - setting `workflow_execution.run_id` is invalid',
    )
    .optional(),
});
export type ExecuteMultiOperationRequest_Operation = z.infer<
  typeof ExecuteMultiOperationRequest_Operation
>;
