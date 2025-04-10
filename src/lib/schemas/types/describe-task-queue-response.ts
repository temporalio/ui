import { z } from 'zod';

export const DescribeTaskQueueResponse = z.object({
  /**
   * Deprecated. Use `versions_info.types_info.pollers` with `ENHANCED` mode instead.
   *  Not set in `ENHANCED` mode.
   */
  pollers: z
    .array(z.any())
    .describe(
      'Deprecated. Use `versions_info.types_info.pollers` with `ENHANCED` mode instead.\n Not set in `ENHANCED` mode.',
    )
    .optional(),
  /**Deprecated. Not set in `ENHANCED` mode.*/
  taskQueueStatus: z
    .any()
    .describe('Deprecated. Not set in `ENHANCED` mode.')
    .optional(),
  /**
   * This map contains Task Queue information for each Build ID. Empty string as key value means unversioned.
   *  Only set in `ENHANCED` mode.
   */
  versionsInfo: z
    .record(z.any())
    .describe(
      'This map contains Task Queue information for each Build ID. Empty string as key value means unversioned.\n Only set in `ENHANCED` mode.',
    )
    .optional(),
  /**
   * Specifies which Worker Deployment Version(s) Server routes this Task Queue's tasks to.
   *  When not present, it means the tasks are routed to Unversioned workers (workers with
   *  UNVERSIONED or unspecified WorkerVersioningMode.)
   *  Task Queue Versioning info is updated indirectly by calling SetWorkerDeploymentCurrentVersion
   *  and SetWorkerDeploymentRampingVersion on Worker Deployments.
   *  Note: This information is not relevant to Pinned workflow executions and their activities as
   *  they are always routed to their Pinned Deployment Version. However, new workflow executions
   *  are typically not Pinned until they complete their first task (unless they are started with
   *  a Pinned VersioningOverride or are Child Workflows of a Pinned parent).
   */
  versioningInfo: z
    .any()
    .describe(
      "Specifies which Worker Deployment Version(s) Server routes this Task Queue's tasks to.\n When not present, it means the tasks are routed to Unversioned workers (workers with\n UNVERSIONED or unspecified WorkerVersioningMode.)\n Task Queue Versioning info is updated indirectly by calling SetWorkerDeploymentCurrentVersion\n and SetWorkerDeploymentRampingVersion on Worker Deployments.\n Note: This information is not relevant to Pinned workflow executions and their activities as\n they are always routed to their Pinned Deployment Version. However, new workflow executions\n are typically not Pinned until they complete their first task (unless they are started with\n a Pinned VersioningOverride or are Child Workflows of a Pinned parent).",
    )
    .optional(),
});
export type DescribeTaskQueueResponse = z.infer<
  typeof DescribeTaskQueueResponse
>;
