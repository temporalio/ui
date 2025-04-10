import { z } from 'zod';

/**
 * NewWorkflowExecutionInfo is a shared message that encapsulates all the
 *  required arguments to starting a workflow in different contexts.
 */
export const NewWorkflowExecutionInfo = z
  .object({
    workflowId: z.string().optional(),
    workflowType: z.any().optional(),
    taskQueue: z.any().optional(),
    /**Serialized arguments to the workflow.*/
    input: z.any().describe('Serialized arguments to the workflow.').optional(),
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
     * Metadata on the workflow if it is started. This is carried over to the WorkflowExecutionConfig
     *  for use by user interfaces to display the fixed as-of-start summary and details of the
     *  workflow.
     */
    userMetadata: z
      .any()
      .describe(
        'Metadata on the workflow if it is started. This is carried over to the WorkflowExecutionConfig\n for use by user interfaces to display the fixed as-of-start summary and details of the\n workflow.',
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
  })
  .describe(
    'NewWorkflowExecutionInfo is a shared message that encapsulates all the\n required arguments to starting a workflow in different contexts.',
  );
export type NewWorkflowExecutionInfo = z.infer<typeof NewWorkflowExecutionInfo>;
