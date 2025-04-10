import { z } from 'zod';

export const WorkflowTaskFailedEventAttributes = z.object({
  /**The id of the `WORKFLOW_TASK_SCHEDULED` event this task corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `WORKFLOW_TASK_SCHEDULED` event this task corresponds to',
    )
    .optional(),
  /**The id of the `WORKFLOW_TASK_STARTED` event this task corresponds to*/
  startedEventId: z
    .string()
    .describe(
      'The id of the `WORKFLOW_TASK_STARTED` event this task corresponds to',
    )
    .optional(),
  cause: z
    .enum([
      'WORKFLOW_TASK_FAILED_CAUSE_UNSPECIFIED',
      'WORKFLOW_TASK_FAILED_CAUSE_UNHANDLED_COMMAND',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_SCHEDULE_ACTIVITY_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_REQUEST_CANCEL_ACTIVITY_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_START_TIMER_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_CANCEL_TIMER_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_RECORD_MARKER_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_COMPLETE_WORKFLOW_EXECUTION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_FAIL_WORKFLOW_EXECUTION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_CANCEL_WORKFLOW_EXECUTION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_CONTINUE_AS_NEW_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_START_TIMER_DUPLICATE_ID',
      'WORKFLOW_TASK_FAILED_CAUSE_RESET_STICKY_TASK_QUEUE',
      'WORKFLOW_TASK_FAILED_CAUSE_WORKFLOW_WORKER_UNHANDLED_FAILURE',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_SIGNAL_WORKFLOW_EXECUTION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_START_CHILD_EXECUTION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_FORCE_CLOSE_COMMAND',
      'WORKFLOW_TASK_FAILED_CAUSE_FAILOVER_CLOSE_COMMAND',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_SIGNAL_INPUT_SIZE',
      'WORKFLOW_TASK_FAILED_CAUSE_RESET_WORKFLOW',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_BINARY',
      'WORKFLOW_TASK_FAILED_CAUSE_SCHEDULE_ACTIVITY_DUPLICATE_ID',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_SEARCH_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_NON_DETERMINISTIC_ERROR',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_MODIFY_WORKFLOW_PROPERTIES_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_PENDING_CHILD_WORKFLOWS_LIMIT_EXCEEDED',
      'WORKFLOW_TASK_FAILED_CAUSE_PENDING_ACTIVITIES_LIMIT_EXCEEDED',
      'WORKFLOW_TASK_FAILED_CAUSE_PENDING_SIGNALS_LIMIT_EXCEEDED',
      'WORKFLOW_TASK_FAILED_CAUSE_PENDING_REQUEST_CANCEL_LIMIT_EXCEEDED',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_UPDATE_WORKFLOW_EXECUTION_MESSAGE',
      'WORKFLOW_TASK_FAILED_CAUSE_UNHANDLED_UPDATE',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_SCHEDULE_NEXUS_OPERATION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_PENDING_NEXUS_OPERATIONS_LIMIT_EXCEEDED',
      'WORKFLOW_TASK_FAILED_CAUSE_BAD_REQUEST_CANCEL_NEXUS_OPERATION_ATTRIBUTES',
      'WORKFLOW_TASK_FAILED_CAUSE_FEATURE_DISABLED',
    ])
    .optional(),
  /**The failure details*/
  failure: z.any().describe('The failure details').optional(),
  /**If a worker explicitly failed this task, it's identity. TODO: What is this set to if server fails the task?*/
  identity: z
    .string()
    .describe(
      "If a worker explicitly failed this task, it's identity. TODO: What is this set to if server fails the task?",
    )
    .optional(),
  /**The original run id of the workflow. For reset workflow.*/
  baseRunId: z
    .string()
    .describe('The original run id of the workflow. For reset workflow.')
    .optional(),
  /**If the workflow is being reset, the new run id.*/
  newRunId: z
    .string()
    .describe('If the workflow is being reset, the new run id.')
    .optional(),
  /**TODO: ?*/
  forkEventVersion: z.string().describe('TODO: ?').optional(),
  /**
   * DEPRECATED since 1.21 - use `worker_version` instead.
   *  If a worker explicitly failed this task, its binary id
   */
  binaryChecksum: z
    .string()
    .describe(
      'DEPRECATED since 1.21 - use `worker_version` instead.\n If a worker explicitly failed this task, its binary id',
    )
    .optional(),
  /**
   * Version info of the worker who processed this workflow task. If present, the `build_id` field
   *  within is also used as `binary_checksum`, which may be omitted in that case (it may also be
   *  populated to preserve compatibility).
   *  Deprecated. Use the info inside the corresponding WorkflowTaskStartedEvent
   */
  workerVersion: z
    .any()
    .describe(
      'Version info of the worker who processed this workflow task. If present, the `build_id` field\n within is also used as `binary_checksum`, which may be omitted in that case (it may also be\n populated to preserve compatibility).\n Deprecated. Use the info inside the corresponding WorkflowTaskStartedEvent',
    )
    .optional(),
});
export type WorkflowTaskFailedEventAttributes = z.infer<
  typeof WorkflowTaskFailedEventAttributes
>;
