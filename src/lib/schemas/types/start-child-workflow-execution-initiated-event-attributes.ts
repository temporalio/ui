import { z } from 'zod';

export const StartChildWorkflowExecutionInitiatedEventAttributes = z.object({
  /**
   * Namespace of the child workflow.
   *  SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.
   */
  namespace: z
    .string()
    .describe(
      'Namespace of the child workflow.\n SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.',
    )
    .optional(),
  namespaceId: z.string().optional(),
  workflowId: z.string().optional(),
  workflowType: z.any().optional(),
  taskQueue: z.any().optional(),
  input: z.any().optional(),
  /**Total workflow execution timeout including retries and continue as new.*/
  workflowExecutionTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'Total workflow execution timeout including retries and continue as new.',
    )
    .optional(),
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
  /**Default: PARENT_CLOSE_POLICY_TERMINATE.*/
  parentClosePolicy: z
    .enum([
      'PARENT_CLOSE_POLICY_UNSPECIFIED',
      'PARENT_CLOSE_POLICY_TERMINATE',
      'PARENT_CLOSE_POLICY_ABANDON',
      'PARENT_CLOSE_POLICY_REQUEST_CANCEL',
    ])
    .describe('Default: PARENT_CLOSE_POLICY_TERMINATE.')
    .optional(),
  /**Deprecated*/
  control: z.string().describe('Deprecated').optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  /**Default: WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE.*/
  workflowIdReusePolicy: z
    .enum([
      'WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED',
      'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE',
      'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY',
      'WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE',
      'WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING',
    ])
    .describe('Default: WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE.')
    .optional(),
  retryPolicy: z.any().optional(),
  /**If this child runs on a cron schedule, it will appear here*/
  cronSchedule: z
    .string()
    .describe('If this child runs on a cron schedule, it will appear here')
    .optional(),
  header: z.any().optional(),
  memo: z.any().optional(),
  searchAttributes: z.any().optional(),
  /**
   * If this is set, the child workflow inherits the Build ID of the parent. Otherwise, the assignment
   *  rules of the child's Task Queue will be used to independently assign a Build ID to it.
   */
  inheritBuildId: z
    .boolean()
    .describe(
      "If this is set, the child workflow inherits the Build ID of the parent. Otherwise, the assignment\n rules of the child's Task Queue will be used to independently assign a Build ID to it.",
    )
    .optional(),
  /**Priority metadata*/
  priority: z.any().describe('Priority metadata').optional(),
});
export type StartChildWorkflowExecutionInitiatedEventAttributes = z.infer<
  typeof StartChildWorkflowExecutionInitiatedEventAttributes
>;
