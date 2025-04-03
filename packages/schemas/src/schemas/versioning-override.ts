import { z } from 'zod';

/**
 * Used to override the versioning behavior (and pinned deployment version, if applicable) of a
 *  specific workflow execution. If set, takes precedence over the worker-sent values. See
 *  `WorkflowExecutionInfo.VersioningInfo` for more information. To remove the override, call
 *  `UpdateWorkflowExecutionOptions` with a null `VersioningOverride`, and use the `update_mask`
 *  to indicate that it should be mutated.
 */
export const VersioningOverride = z
  .object({
    /**Required.*/
    behavior: z
      .enum([
        'VERSIONING_BEHAVIOR_UNSPECIFIED',
        'VERSIONING_BEHAVIOR_PINNED',
        'VERSIONING_BEHAVIOR_AUTO_UPGRADE',
      ])
      .describe('Required.')
      .optional(),
    /**
     * Required if behavior is `PINNED`. Must be null if behavior is `AUTO_UPGRADE`.
     *  Identifies the worker deployment to pin the workflow to.
     *  Deprecated. Use `pinned_version`.
     */
    deployment: z
      .any()
      .describe(
        'Required if behavior is `PINNED`. Must be null if behavior is `AUTO_UPGRADE`.\n Identifies the worker deployment to pin the workflow to.\n Deprecated. Use `pinned_version`.',
      )
      .optional(),
    /**
     * Required if behavior is `PINNED`. Must be absent if behavior is not `PINNED`.
     *  Identifies the worker deployment version to pin the workflow to, in the format
     *  "<deployment_name>.<build_id>".
     */
    pinnedVersion: z
      .string()
      .describe(
        'Required if behavior is `PINNED`. Must be absent if behavior is not `PINNED`.\n Identifies the worker deployment version to pin the workflow to, in the format\n "<deployment_name>.<build_id>".',
      )
      .optional(),
  })
  .describe(
    'Used to override the versioning behavior (and pinned deployment version, if applicable) of a\n specific workflow execution. If set, takes precedence over the worker-sent values. See\n `WorkflowExecutionInfo.VersioningInfo` for more information. To remove the override, call\n `UpdateWorkflowExecutionOptions` with a null `VersioningOverride`, and use the `update_mask`\n to indicate that it should be mutated.',
  );
export type VersioningOverride = z.infer<typeof VersioningOverride>;
