import { z } from 'zod';

export const WorkflowExecutionContinuedAsNewEventAttributes = z.object({
  /**The run ID of the new workflow started by this continue-as-new*/
  newExecutionRunId: z
    .string()
    .describe('The run ID of the new workflow started by this continue-as-new')
    .optional(),
  workflowType: z.any().optional(),
  taskQueue: z.any().optional(),
  input: z.any().optional(),
  /**Timeout of a single workflow run.*/
  workflowRunTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe('Timeout of a single workflow run.')
    .optional(),
  /**Timeout of a single workflow task.*/
  workflowTaskTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe('Timeout of a single workflow task.')
    .optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  /**TODO: How and is this used?*/
  backoffStartInterval: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe('TODO: How and is this used?')
    .optional(),
  initiator: z
    .enum([
      'CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED',
      'CONTINUE_AS_NEW_INITIATOR_WORKFLOW',
      'CONTINUE_AS_NEW_INITIATOR_RETRY',
      'CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE',
    ])
    .optional(),
  /**
   * TODO: David are these right?
   *  Deprecated. If a workflow's retry policy would cause a new run to start when the current one
   *  has failed, this field would be populated with that failure. Now (when supported by server
   *  and sdk) the final event will be `WORKFLOW_EXECUTION_FAILED` with `new_execution_run_id` set.
   */
  failure: z
    .any()
    .describe(
      "TODO: David are these right?\n Deprecated. If a workflow's retry policy would cause a new run to start when the current one\n has failed, this field would be populated with that failure. Now (when supported by server\n and sdk) the final event will be `WORKFLOW_EXECUTION_FAILED` with `new_execution_run_id` set.",
    )
    .optional(),
  /**TODO: Is this the result of *this* workflow as it continued-as-new?*/
  lastCompletionResult: z
    .any()
    .describe(
      'TODO: Is this the result of *this* workflow as it continued-as-new?',
    )
    .optional(),
  header: z.any().optional(),
  memo: z.any().optional(),
  searchAttributes: z.any().optional(),
  /**
   * If this is set, the new execution inherits the Build ID of the current execution. Otherwise,
   *  the assignment rules will be used to independently assign a Build ID to the new execution.
   */
  inheritBuildId: z
    .boolean()
    .describe(
      'If this is set, the new execution inherits the Build ID of the current execution. Otherwise,\n the assignment rules will be used to independently assign a Build ID to the new execution.',
    )
    .optional(),
});
export type WorkflowExecutionContinuedAsNewEventAttributes = z.infer<
  typeof WorkflowExecutionContinuedAsNewEventAttributes
>;
