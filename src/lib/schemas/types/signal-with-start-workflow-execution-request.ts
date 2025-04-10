import { z } from 'zod';

export const SignalWithStartWorkflowExecutionRequest = z.object({
  namespace: z.string().optional(),
  workflowId: z.string().optional(),
  workflowType: z.any().optional(),
  /**The task queue to start this workflow on, if it will be started*/
  taskQueue: z
    .any()
    .describe('The task queue to start this workflow on, if it will be started')
    .optional(),
  /**Serialized arguments to the workflow. These are passed as arguments to the workflow function.*/
  input: z
    .any()
    .describe(
      'Serialized arguments to the workflow. These are passed as arguments to the workflow function.',
    )
    .optional(),
  /**Total workflow execution timeout including retries and continue as new*/
  workflowExecutionTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'Total workflow execution timeout including retries and continue as new',
    )
    .optional(),
  /**Timeout of a single workflow run*/
  workflowRunTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe('Timeout of a single workflow run')
    .optional(),
  /**Timeout of a single workflow task*/
  workflowTaskTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe('Timeout of a single workflow task')
    .optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
  /**Used to de-dupe signal w/ start requests*/
  requestId: z
    .string()
    .describe('Used to de-dupe signal w/ start requests')
    .optional(),
  /**
   * Defines whether to allow re-using the workflow id from a previously *closed* workflow.
   *  The default policy is WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE.
   *
   *  See `workflow_id_reuse_policy` for handling a workflow id duplication with a *running* workflow.
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
      'Defines whether to allow re-using the workflow id from a previously *closed* workflow.\n The default policy is WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE.\n\n See `workflow_id_reuse_policy` for handling a workflow id duplication with a *running* workflow.',
    )
    .optional(),
  /**
   * Defines how to resolve a workflow id conflict with a *running* workflow.
   *  The default policy is WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING.
   *  Note that WORKFLOW_ID_CONFLICT_POLICY_FAIL is an invalid option.
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
      'Defines how to resolve a workflow id conflict with a *running* workflow.\n The default policy is WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING.\n Note that WORKFLOW_ID_CONFLICT_POLICY_FAIL is an invalid option.\n\n See `workflow_id_reuse_policy` for handling a workflow id duplication with a *closed* workflow.',
    )
    .optional(),
  /**The workflow author-defined name of the signal to send to the workflow*/
  signalName: z
    .string()
    .describe(
      'The workflow author-defined name of the signal to send to the workflow',
    )
    .optional(),
  /**Serialized value(s) to provide with the signal*/
  signalInput: z
    .any()
    .describe('Serialized value(s) to provide with the signal')
    .optional(),
  /**Deprecated*/
  control: z.string().describe('Deprecated').optional(),
  /**Retry policy for the workflow*/
  retryPolicy: z.any().describe('Retry policy for the workflow').optional(),
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
   * Time to wait before dispatching the first workflow task. Cannot be used with `cron_schedule`.
   *  Note that the signal will be delivered with the first workflow task. If the workflow gets
   *  another SignalWithStartWorkflow before the delay a workflow task will be dispatched immediately
   *  and the rest of the delay period will be ignored, even if that request also had a delay.
   *  Signal via SignalWorkflowExecution will not unblock the workflow.
   */
  workflowStartDelay: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'Time to wait before dispatching the first workflow task. Cannot be used with `cron_schedule`.\n Note that the signal will be delivered with the first workflow task. If the workflow gets\n another SignalWithStartWorkflow before the delay a workflow task will be dispatched immediately\n and the rest of the delay period will be ignored, even if that request also had a delay.\n Signal via SignalWorkflowExecution will not unblock the workflow.',
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
  /**Links to be associated with the WorkflowExecutionStarted and WorkflowExecutionSignaled events.*/
  links: z
    .array(z.any())
    .describe(
      'Links to be associated with the WorkflowExecutionStarted and WorkflowExecutionSignaled events.',
    )
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
  /**Priority metadata*/
  priority: z.any().describe('Priority metadata').optional(),
});
export type SignalWithStartWorkflowExecutionRequest = z.infer<
  typeof SignalWithStartWorkflowExecutionRequest
>;
