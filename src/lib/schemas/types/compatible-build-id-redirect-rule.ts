import { z } from 'zod';

/**
 * These rules apply to tasks assigned to a particular Build ID
 *  (`source_build_id`) to redirect them to another *compatible* Build ID
 *  (`target_build_id`).
 *
 *  It is user's responsibility to ensure that the target Build ID is compatible
 *  with the source Build ID (e.g. by using the Patching API).
 *
 *  Most deployments are not expected to need these rules, however following
 *  situations can greatly benefit from redirects:
 *   - Need to move long-running Workflow Executions from an old Build ID to a
 *     newer one.
 *   - Need to hotfix some broken or stuck Workflow Executions.
 *
 *  In steady state, redirect rules are beneficial when dealing with old
 *  Executions ran on now-decommissioned Build IDs:
 *   - To redirecting the Workflow Queries to the current (compatible) Build ID.
 *   - To be able to Reset an old Execution so it can run on the current
 *     (compatible) Build ID.
 *
 *  Redirect rules can be chained.
 */
export const CompatibleBuildIdRedirectRule = z
  .object({
    sourceBuildId: z.string().optional(),
    /**
     * Target Build ID must be compatible with the Source Build ID; that is it
     *  must be able to process event histories made by the Source Build ID by
     *  using [Patching](https://docs.temporal.io/workflows#patching) or other
     *  means.
     */
    targetBuildId: z
      .string()
      .describe(
        'Target Build ID must be compatible with the Source Build ID; that is it\n must be able to process event histories made by the Source Build ID by\n using [Patching](https://docs.temporal.io/workflows#patching) or other\n means.',
      )
      .optional(),
  })
  .describe(
    "These rules apply to tasks assigned to a particular Build ID\n (`source_build_id`) to redirect them to another *compatible* Build ID\n (`target_build_id`).\n\n It is user's responsibility to ensure that the target Build ID is compatible\n with the source Build ID (e.g. by using the Patching API).\n\n Most deployments are not expected to need these rules, however following\n situations can greatly benefit from redirects:\n  - Need to move long-running Workflow Executions from an old Build ID to a\n    newer one.\n  - Need to hotfix some broken or stuck Workflow Executions.\n\n In steady state, redirect rules are beneficial when dealing with old\n Executions ran on now-decommissioned Build IDs:\n  - To redirecting the Workflow Queries to the current (compatible) Build ID.\n  - To be able to Reset an old Execution so it can run on the current\n    (compatible) Build ID.\n\n Redirect rules can be chained.",
  );
export type CompatibleBuildIdRedirectRule = z.infer<
  typeof CompatibleBuildIdRedirectRule
>;
