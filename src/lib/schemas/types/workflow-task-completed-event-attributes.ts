import { z } from 'zod';

export const WorkflowTaskCompletedEventAttributes = z.object({
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
  /**Identity of the worker who completed this task*/
  identity: z
    .string()
    .describe('Identity of the worker who completed this task')
    .optional(),
  /**Binary ID of the worker who completed this task*/
  binaryChecksum: z
    .string()
    .describe('Binary ID of the worker who completed this task')
    .optional(),
  /**
   * Version info of the worker who processed this workflow task. If present, the `build_id` field
   *  within is also used as `binary_checksum`, which may be omitted in that case (it may also be
   *  populated to preserve compatibility).
   *  Deprecated. Use `deployment` and `versioning_behavior` instead.
   */
  workerVersion: z
    .any()
    .describe(
      'Version info of the worker who processed this workflow task. If present, the `build_id` field\n within is also used as `binary_checksum`, which may be omitted in that case (it may also be\n populated to preserve compatibility).\n Deprecated. Use `deployment` and `versioning_behavior` instead.',
    )
    .optional(),
  /**
   * Data the SDK wishes to record for itself, but server need not interpret, and does not
   *  directly impact workflow state.
   */
  sdkMetadata: z
    .any()
    .describe(
      'Data the SDK wishes to record for itself, but server need not interpret, and does not\n directly impact workflow state.',
    )
    .optional(),
  /**Local usage data sent during workflow task completion and recorded here for posterity*/
  meteringMetadata: z
    .any()
    .describe(
      'Local usage data sent during workflow task completion and recorded here for posterity',
    )
    .optional(),
  /**
   * The deployment that completed this task. May or may not be set for unversioned workers,
   *  depending on whether a value is sent by the SDK. This value updates workflow execution's
   *  `versioning_info.deployment`.
   *  Deprecated. Replaced with `worker_deployment_version`.
   */
  deployment: z
    .any()
    .describe(
      "The deployment that completed this task. May or may not be set for unversioned workers,\n depending on whether a value is sent by the SDK. This value updates workflow execution's\n `versioning_info.deployment`.\n Deprecated. Replaced with `worker_deployment_version`.",
    )
    .optional(),
  /**
   * Versioning behavior sent by the worker that completed this task for this particular workflow
   *  execution. UNSPECIFIED means the task was completed by an unversioned worker. This value
   *  updates workflow execution's `versioning_info.behavior`.
   */
  versioningBehavior: z
    .enum([
      'VERSIONING_BEHAVIOR_UNSPECIFIED',
      'VERSIONING_BEHAVIOR_PINNED',
      'VERSIONING_BEHAVIOR_AUTO_UPGRADE',
    ])
    .describe(
      "Versioning behavior sent by the worker that completed this task for this particular workflow\n execution. UNSPECIFIED means the task was completed by an unversioned worker. This value\n updates workflow execution's `versioning_info.behavior`.",
    )
    .optional(),
  /**
   * The Worker Deployment Version that completed this task. Must be set if `versioning_behavior`
   *  is set. This value updates workflow execution's `versioning_info.version`.
   *  Experimental. Worker Deployments are experimental and might significantly change in the future.
   */
  workerDeploymentVersion: z
    .string()
    .describe(
      "The Worker Deployment Version that completed this task. Must be set if `versioning_behavior`\n is set. This value updates workflow execution's `versioning_info.version`.\n Experimental. Worker Deployments are experimental and might significantly change in the future.",
    )
    .optional(),
  /**
   * The name of Worker Deployment that completed this task. Must be set if `versioning_behavior`
   *  is set. This value updates workflow execution's `worker_deployment_name`.
   *  Experimental. Worker Deployments are experimental and might significantly change in the future.
   */
  workerDeploymentName: z
    .string()
    .describe(
      "The name of Worker Deployment that completed this task. Must be set if `versioning_behavior`\n is set. This value updates workflow execution's `worker_deployment_name`.\n Experimental. Worker Deployments are experimental and might significantly change in the future.",
    )
    .optional(),
});
export type WorkflowTaskCompletedEventAttributes = z.infer<
  typeof WorkflowTaskCompletedEventAttributes
>;
