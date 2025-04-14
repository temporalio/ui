import { z } from 'zod';

export const WorkflowExecutionOptionsUpdatedEventAttributes = z.object({
  /**
   * Versioning override upserted in this event.
   *  Ignored if nil or if unset_versioning_override is true.
   */
  versioningOverride: z
    .any()
    .describe(
      'Versioning override upserted in this event.\n Ignored if nil or if unset_versioning_override is true.',
    )
    .optional(),
  /**Versioning override removed in this event.*/
  unsetVersioningOverride: z
    .boolean()
    .describe('Versioning override removed in this event.')
    .optional(),
  /**
   * Request ID attachedto the running workflow execution so that subsequent requests with same
   *  request ID will be deduped.
   */
  attachedRequestId: z
    .string()
    .describe(
      'Request ID attachedto the running workflow execution so that subsequent requests with same\n request ID will be deduped.',
    )
    .optional(),
  /**Completion callbacks attached to the running workflow execution.*/
  attachedCompletionCallbacks: z
    .array(z.any())
    .describe(
      'Completion callbacks attached to the running workflow execution.',
    )
    .optional(),
});
export type WorkflowExecutionOptionsUpdatedEventAttributes = z.infer<
  typeof WorkflowExecutionOptionsUpdatedEventAttributes
>;
