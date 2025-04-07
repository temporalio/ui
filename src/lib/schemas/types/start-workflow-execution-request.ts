import { z } from 'zod';

export const StartWorkflowExecutionRequest = z.object({
  namespace: z.string().optional(),
  workflowId: z.string().optional(),
  workflowType: z.any().optional(),
  taskQueue: z.any().optional(),
  /**Serialized arguments to the workflow. These are passed as arguments to the workflow function.*/
  input: z
    .any()
    .describe(
      'Serialized arguments to the workflow. These are passed as arguments to the workflow function.',
    )
    .optional(),
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
  /**The identity of the client who initiated this request*/
  identity: z
    .string()
    .describe('The identity of the client who initiated this request')
    .optional(),
  /**A unique identifier for this start request. Typically UUIDv4.*/
  requestId: z
    .string()
    .describe('A unique identifier for this start request. Typically UUIDv4.')
    .optional(),
  /**
   * Defines whether to allow re-using the workflow id from a previously *closed* workflow.
   *  The default policy is WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE.
   *
   *  See `workflow_id_conflict_policy` for handling a workflow id duplication with a *running* workflow.
   */
  workflowIdReusePolicy: z
    .enum([
      'WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED',
      'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE',
      'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY',
      'WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE',
      'WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING',
    ])
    .describe(
      'Defines whether to allow re-using the workflow id from a previously *closed* workflow.\n The default policy is WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE.\n\n See `workflow_id_conflict_policy` for handling a workflow id duplication with a *running* workflow.',
    )
    .optional(),
  /**
   * Defines how to resolve a workflow id conflict with a *running* workflow.
   *  The default policy is WORKFLOW_ID_CONFLICT_POLICY_FAIL.
   *
   *  See `workflow_id_reuse_policy` for handling a workflow id duplication with a *closed* workflow.
   */
  workflowIdConflictPolicy: z
    .enum([
      'WORKFLOW_ID_CONFLICT_POLICY_UNSPECIFIED',
      'WORKFLOW_ID_CONFLICT_POLICY_FAIL',
      'WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING',
      'WORKFLOW_ID_CONFLICT_POLICY_TERMINATE_EXISTING',
    ])
    .describe(
      'Defines how to resolve a workflow id conflict with a *running* workflow.\n The default policy is WORKFLOW_ID_CONFLICT_POLICY_FAIL.\n\n See `workflow_id_reuse_policy` for handling a workflow id duplication with a *closed* workflow.',
    )
    .optional(),
  /**The retry policy for the workflow. Will never exceed `workflow_execution_timeout`.*/
  retryPolicy: z
    .any()
    .describe(
      'The retry policy for the workflow. Will never exceed `workflow_execution_timeout`.',
    )
    .optional(),
  /**See https://docs.temporal.io/docs/content/what-is-a-temporal-cron-job/*/
  cronSchedule: z
    .string()
    .describe(
      'See https://docs.temporal.io/docs/content/what-is-a-temporal-cron-job/',
    )
    .optional(),
  memo: z.any().optional(),
  searchAttributes: z.any().optional(),
  header: z.any().optional(),
  /**
   * Request to get the first workflow task inline in the response bypassing matching service and worker polling.
   *  If set to `true` the caller is expected to have a worker available and capable of processing the task.
   *  The returned task will be marked as started and is expected to be completed by the specified
   *  `workflow_task_timeout`.
   */
  requestEagerExecution: z
    .boolean()
    .describe(
      'Request to get the first workflow task inline in the response bypassing matching service and worker polling.\n If set to `true` the caller is expected to have a worker available and capable of processing the task.\n The returned task will be marked as started and is expected to be completed by the specified\n `workflow_task_timeout`.',
    )
    .optional(),
  /**
   * These values will be available as ContinuedFailure and LastCompletionResult in the
   *  WorkflowExecutionStarted event and through SDKs. The are currently only used by the
   *  server itself (for the schedules feature) and are not intended to be exposed in
   *  StartWorkflowExecution.
   */
  continuedFailure: z
    .any()
    .describe(
      'These values will be available as ContinuedFailure and LastCompletionResult in the\n WorkflowExecutionStarted event and through SDKs. The are currently only used by the\n server itself (for the schedules feature) and are not intended to be exposed in\n StartWorkflowExecution.',
    )
    .optional(),
  lastCompletionResult: z.any().optional(),
  /**
   * Time to wait before dispatching the first workflow task. Cannot be used with `cron_schedule`.
   *  If the workflow gets a signal before the delay, a workflow task will be dispatched and the rest
   *  of the delay will be ignored.
   */
  workflowStartDelay: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'Time to wait before dispatching the first workflow task. Cannot be used with `cron_schedule`.\n If the workflow gets a signal before the delay, a workflow task will be dispatched and the rest\n of the delay will be ignored.',
    )
    .optional(),
  /**
   * Callbacks to be called by the server when this workflow reaches a terminal state.
   *  If the workflow continues-as-new, these callbacks will be carried over to the new execution.
   *  Callback addresses must be whitelisted in the server's dynamic configuration.
   */
  completionCallbacks: z
    .array(z.any())
    .describe(
      "Callbacks to be called by the server when this workflow reaches a terminal state.\n If the workflow continues-as-new, these callbacks will be carried over to the new execution.\n Callback addresses must be whitelisted in the server's dynamic configuration.",
    )
    .optional(),
  /**
   * Metadata on the workflow if it is started. This is carried over to the WorkflowExecutionInfo
   *  for use by user interfaces to display the fixed as-of-start summary and details of the
   *  workflow.
   */
  userMetadata: z
    .any()
    .describe(
      'Metadata on the workflow if it is started. This is carried over to the WorkflowExecutionInfo\n for use by user interfaces to display the fixed as-of-start summary and details of the\n workflow.',
    )
    .optional(),
  /**Links to be associated with the workflow.*/
  links: z
    .array(z.any())
    .describe('Links to be associated with the workflow.')
    .optional(),
  /**
   * If set, takes precedence over the Versioning Behavior sent by the SDK on Workflow Task completion.
   *  To unset the override after the workflow is running, use UpdateWorkflowExecutionOptions.
   */
  versioningOverride: z
    .any()
    .describe(
      'If set, takes precedence over the Versioning Behavior sent by the SDK on Workflow Task completion.\n To unset the override after the workflow is running, use UpdateWorkflowExecutionOptions.',
    )
    .optional(),
  /**
   * Defines actions to be done to the existing running workflow when the conflict policy
   *  WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING is used. If not set (ie., nil value) or set to a
   *  empty object (ie., all options with default value), it won't do anything to the existing
   *  running workflow. If set, it will add a history event to the running workflow.
   */
  onConflictOptions: z
    .any()
    .describe(
      "Defines actions to be done to the existing running workflow when the conflict policy\n WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING is used. If not set (ie., nil value) or set to a\n empty object (ie., all options with default value), it won't do anything to the existing\n running workflow. If set, it will add a history event to the running workflow.",
    )
    .optional(),
  /**Priority metadata*/
  priority: z.any().describe('Priority metadata').optional(),
});
export type StartWorkflowExecutionRequest = z.infer<
  typeof StartWorkflowExecutionRequest
>;
