import { z } from 'zod';

/**
 * Hold basic information about a workflow execution.
 *  This structure is a part of visibility, and thus contain a limited subset of information.
 */
export const WorkflowExecutionInfo = z
  .object({
    execution: z.any().optional(),
    type: z.any().optional(),
    startTime: z.string().datetime({ offset: true }).optional(),
    closeTime: z.string().datetime({ offset: true }).optional(),
    status: z
      .enum([
        'WORKFLOW_EXECUTION_STATUS_UNSPECIFIED',
        'WORKFLOW_EXECUTION_STATUS_RUNNING',
        'WORKFLOW_EXECUTION_STATUS_COMPLETED',
        'WORKFLOW_EXECUTION_STATUS_FAILED',
        'WORKFLOW_EXECUTION_STATUS_CANCELED',
        'WORKFLOW_EXECUTION_STATUS_TERMINATED',
        'WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW',
        'WORKFLOW_EXECUTION_STATUS_TIMED_OUT',
      ])
      .optional(),
    historyLength: z.string().optional(),
    parentNamespaceId: z.string().optional(),
    parentExecution: z.any().optional(),
    executionTime: z.string().datetime({ offset: true }).optional(),
    memo: z.any().optional(),
    searchAttributes: z.any().optional(),
    autoResetPoints: z.any().optional(),
    taskQueue: z.string().optional(),
    stateTransitionCount: z.string().optional(),
    historySizeBytes: z.string().optional(),
    /**
     * If set, the most recent worker version stamp that appeared in a workflow task completion
     *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
     */
    mostRecentWorkerVersionStamp: z
      .any()
      .describe(
        'If set, the most recent worker version stamp that appeared in a workflow task completion\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
      )
      .optional(),
    /**
     * Workflow execution duration is defined as difference between close time and execution time.
     *  This field is only populated if the workflow is closed.
     */
    executionDuration: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe(
        'Workflow execution duration is defined as difference between close time and execution time.\n This field is only populated if the workflow is closed.',
      )
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
    rootExecution: z
      .any()
      .describe(
        'Contains information about the root workflow execution.\n The root workflow execution is defined as follows:\n 1. A workflow without parent workflow is its own root workflow.\n 2. A workflow that has a parent workflow has the same root workflow as its parent workflow.\n Note: workflows continued as new or reseted may or may not have parents, check examples below.\n\n Examples:\n   Scenario 1: Workflow W1 starts child workflow W2, and W2 starts child workflow W3.\n     - The root workflow of all three workflows is W1.\n   Scenario 2: Workflow W1 starts child workflow W2, and W2 continued as new W3.\n     - The root workflow of all three workflows is W1.\n   Scenario 3: Workflow W1 continued as new W2.\n     - The root workflow of W1 is W1 and the root workflow of W2 is W2.\n   Scenario 4: Workflow W1 starts child workflow W2, and W2 is reseted, creating W3\n     - The root workflow of all three workflows is W1.\n   Scenario 5: Workflow W1 is reseted, creating W2.\n     - The root workflow of W1 is W1 and the root workflow of W2 is W2.',
      )
      .optional(),
    /**
     * The currently assigned build ID for this execution. Presence of this value means worker versioning is used
     *  for this execution. Assigned build ID is selected based on Worker Versioning Assignment Rules
     *  when the first workflow task of the execution is scheduled. If the first workflow task fails and is scheduled
     *  again, the assigned build ID may change according to the latest versioning rules.
     *  Assigned build ID can also change in the middle of a execution if Compatible Redirect Rules are applied to
     *  this execution.
     *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
     */
    assignedBuildId: z
      .string()
      .describe(
        'The currently assigned build ID for this execution. Presence of this value means worker versioning is used\n for this execution. Assigned build ID is selected based on Worker Versioning Assignment Rules\n when the first workflow task of the execution is scheduled. If the first workflow task fails and is scheduled\n again, the assigned build ID may change according to the latest versioning rules.\n Assigned build ID can also change in the middle of a execution if Compatible Redirect Rules are applied to\n this execution.\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
      )
      .optional(),
    /**
     * Build ID inherited from a previous/parent execution. If present, assigned_build_id will be set to this, instead
     *  of using the assignment rules.
     *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
     */
    inheritedBuildId: z
      .string()
      .describe(
        'Build ID inherited from a previous/parent execution. If present, assigned_build_id will be set to this, instead\n of using the assignment rules.\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
      )
      .optional(),
    /**
     * The first run ID in the execution chain.
     *  Executions created via the following operations are considered to be in the same chain
     *  - ContinueAsNew
     *  - Workflow Retry
     *  - Workflow Reset
     *  - Cron Schedule
     */
    firstRunId: z
      .string()
      .describe(
        'The first run ID in the execution chain.\n Executions created via the following operations are considered to be in the same chain\n - ContinueAsNew\n - Workflow Retry\n - Workflow Reset\n - Cron Schedule',
      )
      .optional(),
    /**
     * Absent value means the workflow execution is not versioned. When present, the execution might
     *  be versioned or unversioned, depending on `versioning_info.behavior` and `versioning_info.versioning_override`.
     *  Experimental. Versioning info is experimental and might change in the future.
     */
    versioningInfo: z
      .any()
      .describe(
        'Absent value means the workflow execution is not versioned. When present, the execution might\n be versioned or unversioned, depending on `versioning_info.behavior` and `versioning_info.versioning_override`.\n Experimental. Versioning info is experimental and might change in the future.',
      )
      .optional(),
    /**
     * The name of Worker Deployment that completed the most recent workflow task.
     *  Experimental. Worker Deployments are experimental and might change in the future.
     */
    workerDeploymentName: z
      .string()
      .describe(
        'The name of Worker Deployment that completed the most recent workflow task.\n Experimental. Worker Deployments are experimental and might change in the future.',
      )
      .optional(),
    /**Priority metadata*/
    priority: z.any().describe('Priority metadata').optional(),
  })
  .describe(
    'Hold basic information about a workflow execution.\n This structure is a part of visibility, and thus contain a limited subset of information.',
  );
export type WorkflowExecutionInfo = z.infer<typeof WorkflowExecutionInfo>;
