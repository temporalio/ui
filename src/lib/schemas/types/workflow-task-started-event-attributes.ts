import { z } from 'zod';

export const WorkflowTaskStartedEventAttributes = z.object({
  /**The id of the `WORKFLOW_TASK_SCHEDULED` event this task corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `WORKFLOW_TASK_SCHEDULED` event this task corresponds to',
    )
    .optional(),
  /**Identity of the worker who picked up this task*/
  identity: z
    .string()
    .describe('Identity of the worker who picked up this task')
    .optional(),
  /**TODO: ? Appears unused?*/
  requestId: z.string().describe('TODO: ? Appears unused?').optional(),
  /**
   * True if this workflow should continue-as-new soon because its history size (in
   *  either event count or bytes) is getting large.
   */
  suggestContinueAsNew: z
    .boolean()
    .describe(
      'True if this workflow should continue-as-new soon because its history size (in\n either event count or bytes) is getting large.',
    )
    .optional(),
  /**
   * Total history size in bytes, which the workflow might use to decide when to
   *  continue-as-new regardless of the suggestion. Note that history event count is
   *  just the event id of this event, so we don't include it explicitly here.
   */
  historySizeBytes: z
    .string()
    .describe(
      "Total history size in bytes, which the workflow might use to decide when to\n continue-as-new regardless of the suggestion. Note that history event count is\n just the event id of this event, so we don't include it explicitly here.",
    )
    .optional(),
  /**
   * Version info of the worker to whom this task was dispatched.
   *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
   */
  workerVersion: z
    .any()
    .describe(
      'Version info of the worker to whom this task was dispatched.\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
    )
    .optional(),
  /**
   * Used by server internally to properly reapply build ID redirects to an execution
   *  when rebuilding it from events.
   *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
   */
  buildIdRedirectCounter: z
    .string()
    .describe(
      'Used by server internally to properly reapply build ID redirects to an execution\n when rebuilding it from events.\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
    )
    .optional(),
});
export type WorkflowTaskStartedEventAttributes = z.infer<
  typeof WorkflowTaskStartedEventAttributes
>;
