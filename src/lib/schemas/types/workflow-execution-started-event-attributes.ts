import { z } from 'zod';

/**Always the first event in workflow history*/
export const WorkflowExecutionStartedEventAttributes = z
  .object({
    workflowType: z.any().optional(),
    /**
     * If this workflow is a child, the namespace our parent lives in.
     *  SDKs and UI tools should use `parent_workflow_namespace` field but server must use `parent_workflow_namespace_id` only.
     */
    parentWorkflowNamespace: z
      .string()
      .describe(
        'If this workflow is a child, the namespace our parent lives in.\n SDKs and UI tools should use `parent_workflow_namespace` field but server must use `parent_workflow_namespace_id` only.',
      )
      .optional(),
    parentWorkflowNamespaceId: z.string().optional(),
    /**
     * Contains information about parent workflow execution that initiated the child workflow these attributes belong to.
     *  If the workflow these attributes belong to is not a child workflow of any other execution, this field will not be populated.
     */
    parentWorkflowExecution: z
      .any()
      .describe(
        'Contains information about parent workflow execution that initiated the child workflow these attributes belong to.\n If the workflow these attributes belong to is not a child workflow of any other execution, this field will not be populated.',
      )
      .optional(),
    /**EventID of the child execution initiated event in parent workflow*/
    parentInitiatedEventId: z
      .string()
      .describe(
        'EventID of the child execution initiated event in parent workflow',
      )
      .optional(),
    taskQueue: z.any().optional(),
    /**SDK will deserialize this and provide it as arguments to the workflow function*/
    input: z
      .any()
      .describe(
        'SDK will deserialize this and provide it as arguments to the workflow function',
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
    /**
     * Run id of the previous workflow which continued-as-new or retired or cron executed into this
     *  workflow.
     */
    continuedExecutionRunId: z
      .string()
      .describe(
        'Run id of the previous workflow which continued-as-new or retired or cron executed into this\n workflow.',
      )
      .optional(),
    initiator: z
      .enum([
        'CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED',
        'CONTINUE_AS_NEW_INITIATOR_WORKFLOW',
        'CONTINUE_AS_NEW_INITIATOR_RETRY',
        'CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE',
      ])
      .optional(),
    continuedFailure: z.any().optional(),
    lastCompletionResult: z.any().optional(),
    /**
     * This is the run id when the WorkflowExecutionStarted event was written.
     *  A workflow reset changes the execution run_id, but preserves this field.
     */
    originalExecutionRunId: z
      .string()
      .describe(
        'This is the run id when the WorkflowExecutionStarted event was written.\n A workflow reset changes the execution run_id, but preserves this field.',
      )
      .optional(),
    /**Identity of the client who requested this execution*/
    identity: z
      .string()
      .describe('Identity of the client who requested this execution')
      .optional(),
    /**
     * This is the very first runId along the chain of ContinueAsNew, Retry, Cron and Reset.
     *  Used to identify a chain.
     */
    firstExecutionRunId: z
      .string()
      .describe(
        'This is the very first runId along the chain of ContinueAsNew, Retry, Cron and Reset.\n Used to identify a chain.',
      )
      .optional(),
    retryPolicy: z.any().optional(),
    /**Starting at 1, the number of times we have tried to execute this workflow*/
    attempt: z
      .number()
      .int()
      .describe(
        'Starting at 1, the number of times we have tried to execute this workflow',
      )
      .optional(),
    /**
     * The absolute time at which the workflow will be timed out.
     *  This is passed without change to the next run/retry of a workflow.
     */
    workflowExecutionExpirationTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'The absolute time at which the workflow will be timed out.\n This is passed without change to the next run/retry of a workflow.',
      )
      .optional(),
    /**If this workflow runs on a cron schedule, it will appear here*/
    cronSchedule: z
      .string()
      .describe('If this workflow runs on a cron schedule, it will appear here')
      .optional(),
    /**
     * For a cron workflow, this contains the amount of time between when this iteration of
     *  the cron workflow was scheduled and when it should run next per its cron_schedule.
     */
    firstWorkflowTaskBackoff: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe(
        'For a cron workflow, this contains the amount of time between when this iteration of\n the cron workflow was scheduled and when it should run next per its cron_schedule.',
      )
      .optional(),
    memo: z.any().optional(),
    searchAttributes: z.any().optional(),
    prevAutoResetPoints: z.any().optional(),
    header: z.any().optional(),
    /**
     * Version of the child execution initiated event in parent workflow
     *  It should be used together with parent_initiated_event_id to identify
     *  a child initiated event for global namespace
     */
    parentInitiatedEventVersion: z
      .string()
      .describe(
        'Version of the child execution initiated event in parent workflow\n It should be used together with parent_initiated_event_id to identify\n a child initiated event for global namespace',
      )
      .optional(),
    /**This field is new in 1.21.*/
    workflowId: z.string().describe('This field is new in 1.21.').optional(),
    /**
     * If this workflow intends to use anything other than the current overall default version for
     *  the queue, then we include it here.
     *  Deprecated. [cleanup-experimental-wv]
     */
    sourceVersionStamp: z
      .any()
      .describe(
        'If this workflow intends to use anything other than the current overall default version for\n the queue, then we include it here.\n Deprecated. [cleanup-experimental-wv]',
      )
      .optional(),
    /**Completion callbacks attached when this workflow was started.*/
    completionCallbacks: z
      .array(z.any())
      .describe('Completion callbacks attached when this workflow was started.')
      .optional(),
    /**
     * Contains information about the root workflow execution.
     *  The root workflow execution is defined as follows:
     *  1. A workflow without parent workflow is its own root workflow.
     *  2. A workflow that has a parent workflow has the same root workflow as its parent workflow.
     *  Note: workflows continued as new or reseted may or may not have parents, check examples below.
     *
     *  Examples:
     *    Scenario 1: Workflow W1 starts child workflow W2, and W2 starts child workflow W3.
     *      - The root workflow of all three workflows is W1.
     *    Scenario 2: Workflow W1 starts child workflow W2, and W2 continued as new W3.
     *      - The root workflow of all three workflows is W1.
     *    Scenario 3: Workflow W1 continued as new W2.
     *      - The root workflow of W1 is W1 and the root workflow of W2 is W2.
     *    Scenario 4: Workflow W1 starts child workflow W2, and W2 is reseted, creating W3
     *      - The root workflow of all three workflows is W1.
     *    Scenario 5: Workflow W1 is reseted, creating W2.
     *      - The root workflow of W1 is W1 and the root workflow of W2 is W2.
     */
    rootWorkflowExecution: z
      .any()
      .describe(
        'Contains information about the root workflow execution.\n The root workflow execution is defined as follows:\n 1. A workflow without parent workflow is its own root workflow.\n 2. A workflow that has a parent workflow has the same root workflow as its parent workflow.\n Note: workflows continued as new or reseted may or may not have parents, check examples below.\n\n Examples:\n   Scenario 1: Workflow W1 starts child workflow W2, and W2 starts child workflow W3.\n     - The root workflow of all three workflows is W1.\n   Scenario 2: Workflow W1 starts child workflow W2, and W2 continued as new W3.\n     - The root workflow of all three workflows is W1.\n   Scenario 3: Workflow W1 continued as new W2.\n     - The root workflow of W1 is W1 and the root workflow of W2 is W2.\n   Scenario 4: Workflow W1 starts child workflow W2, and W2 is reseted, creating W3\n     - The root workflow of all three workflows is W1.\n   Scenario 5: Workflow W1 is reseted, creating W2.\n     - The root workflow of W1 is W1 and the root workflow of W2 is W2.',
      )
      .optional(),
    /**
     * When present, this execution is assigned to the build ID of its parent or previous execution.
     *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
     */
    inheritedBuildId: z
      .string()
      .describe(
        'When present, this execution is assigned to the build ID of its parent or previous execution.\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
      )
      .optional(),
    /**Versioning override applied to this workflow when it was started.*/
    versioningOverride: z
      .any()
      .describe(
        'Versioning override applied to this workflow when it was started.',
      )
      .optional(),
    /**
     * When present, it means this is a child workflow of a parent that is Pinned to this Worker
     *  Deployment Version. In this case, child workflow will start as Pinned to this Version instead
     *  of starting on the Current Version of its Task Queue.
     *  This is set only if the child workflow is starting on a Task Queue belonging to the same
     *  Worker Deployment Version.
     */
    parentPinnedWorkerDeploymentVersion: z
      .string()
      .describe(
        'When present, it means this is a child workflow of a parent that is Pinned to this Worker\n Deployment Version. In this case, child workflow will start as Pinned to this Version instead\n of starting on the Current Version of its Task Queue.\n This is set only if the child workflow is starting on a Task Queue belonging to the same\n Worker Deployment Version.',
      )
      .optional(),
    /**Priority metadata*/
    priority: z.any().describe('Priority metadata').optional(),
  })
  .describe('Always the first event in workflow history');
export type WorkflowExecutionStartedEventAttributes = z.infer<
  typeof WorkflowExecutionStartedEventAttributes
>;
