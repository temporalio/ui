import { z } from 'zod';

/**
 * A Worker Deployment Version (Version, for short) represents all workers of the same
 *  code and config within a Deployment. Workers of the same Version are expected to
 *  behave exactly the same so when executions move between them there are no
 *  non-determinism issues.
 *  Worker Deployment Versions are created in Temporal server automatically when
 *  their first poller arrives to the server.
 *  Experimental. Worker Deployments are experimental and might significantly change in the future.
 */
export const WorkerDeploymentVersionInfo = z
  .object({
    /**The fully-qualified string representation of the version, in the form "<deployment_name>.<build_id>".*/
    version: z
      .string()
      .describe(
        'The fully-qualified string representation of the version, in the form "<deployment_name>.<build_id>".',
      )
      .optional(),
    deploymentName: z.string().optional(),
    createTime: z.string().datetime({ offset: true }).optional(),
    /**Last time `current_since_time`, `ramping_since_time, or `ramp_percentage` of this version changed.*/
    routingChangedTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'Last time `current_since_time`, `ramping_since_time, or `ramp_percentage` of this version changed.',
      )
      .optional(),
    /**
     * (-- api-linter: core::0140::prepositions=disabled
     *      aip.dev/not-precedent: 'Since' captures the field semantics despite being a preposition. --)
     *  Nil if not current.
     */
    currentSinceTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        "(-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: 'Since' captures the field semantics despite being a preposition. --)\n Nil if not current.",
      )
      .optional(),
    /**
     * (-- api-linter: core::0140::prepositions=disabled
     *      aip.dev/not-precedent: 'Since' captures the field semantics despite being a preposition. --)
     *  Nil if not ramping. Updated when the version first starts ramping, not on each ramp change.
     */
    rampingSinceTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        "(-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: 'Since' captures the field semantics despite being a preposition. --)\n Nil if not ramping. Updated when the version first starts ramping, not on each ramp change.",
      )
      .optional(),
    /**
     * Range: [0, 100]. Must be zero if the version is not ramping (i.e. `ramping_since_time` is nil).
     *  Can be in the range [0, 100] if the version is ramping.
     */
    rampPercentage: z
      .number()
      .describe(
        'Range: [0, 100]. Must be zero if the version is not ramping (i.e. `ramping_since_time` is nil).\n Can be in the range [0, 100] if the version is ramping.',
      )
      .optional(),
    /**All the Task Queues that have ever polled from this Deployment version.*/
    taskQueueInfos: z
      .array(z.any())
      .describe(
        'All the Task Queues that have ever polled from this Deployment version.',
      )
      .optional(),
    /**
     * Helps user determine when it is safe to decommission the workers of this
     *  Version. Not present when version is current or ramping.
     *  Current limitations:
     *  - Not supported for Unversioned mode.
     *  - Periodically refreshed, may have delays up to few minutes (consult the
     *    last_checked_time value).
     *  - Refreshed only when version is not current or ramping AND the status is not
     *    "drained" yet.
     *  - Once the status is changed to "drained", it is not changed until the Version
     *    becomes Current or Ramping again, at which time the drainage info is cleared.
     *    This means if the Version is "drained" but new workflows are sent to it via
     *    Pinned Versioning Override, the status does not account for those Pinned-override
     *    executions and remains "drained".
     */
    drainageInfo: z
      .any()
      .describe(
        'Helps user determine when it is safe to decommission the workers of this\n Version. Not present when version is current or ramping.\n Current limitations:\n - Not supported for Unversioned mode.\n - Periodically refreshed, may have delays up to few minutes (consult the\n   last_checked_time value).\n - Refreshed only when version is not current or ramping AND the status is not\n   "drained" yet.\n - Once the status is changed to "drained", it is not changed until the Version\n   becomes Current or Ramping again, at which time the drainage info is cleared.\n   This means if the Version is "drained" but new workflows are sent to it via\n   Pinned Versioning Override, the status does not account for those Pinned-override\n   executions and remains "drained".',
      )
      .optional(),
    /**Arbitrary user-provided metadata attached to this version.*/
    metadata: z
      .any()
      .describe('Arbitrary user-provided metadata attached to this version.')
      .optional(),
  })
  .describe(
    'A Worker Deployment Version (Version, for short) represents all workers of the same \n code and config within a Deployment. Workers of the same Version are expected to \n behave exactly the same so when executions move between them there are no \n non-determinism issues.\n Worker Deployment Versions are created in Temporal server automatically when \n their first poller arrives to the server.\n Experimental. Worker Deployments are experimental and might significantly change in the future.',
  );
export type WorkerDeploymentVersionInfo = z.infer<
  typeof WorkerDeploymentVersionInfo
>;
