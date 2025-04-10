import { z } from 'zod';

export const WorkflowExecutionOptions = z.object({
  /**If set, takes precedence over the Versioning Behavior sent by the SDK on Workflow Task completion.*/
  versioningOverride: z
    .any()
    .describe(
      'If set, takes precedence over the Versioning Behavior sent by the SDK on Workflow Task completion.',
    )
    .optional(),
});
export type WorkflowExecutionOptions = z.infer<typeof WorkflowExecutionOptions>;
