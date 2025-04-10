import { z } from 'zod';

/**
 * Holds all the information about worker versioning for a particular workflow execution.
 *  Experimental. Versioning info is experimental and might change in the future.
 */
export const WorkflowExecutionVersioningInfo = z
  .object({
    /**
     * Versioning behavior determines how the server should treat this execution when workers are
     *  upgraded. When present it means this workflow execution is versioned; UNSPECIFIED means
     *  unversioned. See the comments in `VersioningBehavior` enum for more info about different
     *  behaviors.
     *  This field is first set after an execution completes its first workflow task on a versioned
     *  worker, and set again on completion of every subsequent workflow task.
     *  For child workflows of Pinned parents, this will be set to Pinned (along with `version`) when
     *  the the child starts so that child's first workflow task goes to the same Version as the
     *  parent. After the first workflow task, it depends on the child workflow itself if it wants
     *  to stay pinned or become unpinned (according to Versioning Behavior set in the worker).
     *  Note that `behavior` is overridden by `versioning_override` if the latter is present.
     */
    behavior: z
      .enum([
        'VERSIONING_BEHAVIOR_UNSPECIFIED',
        'VERSIONING_BEHAVIOR_PINNED',
        'VERSIONING_BEHAVIOR_AUTO_UPGRADE',
      ])
      .describe(
        "Versioning behavior determines how the server should treat this execution when workers are\n upgraded. When present it means this workflow execution is versioned; UNSPECIFIED means\n unversioned. See the comments in `VersioningBehavior` enum for more info about different\n behaviors.\n This field is first set after an execution completes its first workflow task on a versioned\n worker, and set again on completion of every subsequent workflow task.\n For child workflows of Pinned parents, this will be set to Pinned (along with `version`) when\n the the child starts so that child's first workflow task goes to the same Version as the\n parent. After the first workflow task, it depends on the child workflow itself if it wants\n to stay pinned or become unpinned (according to Versioning Behavior set in the worker).\n Note that `behavior` is overridden by `versioning_override` if the latter is present.",
      )
      .optional(),
    /**
     * The worker deployment that completed the last workflow task of this workflow execution. Must
     *  be present if `behavior` is set. Absent value means no workflow task is completed, or the
     *  last workflow task was completed by an unversioned worker. Unversioned workers may still send
     *  a deployment value which will be stored here, so the right way to check if an execution is
     *  versioned if an execution is versioned or not is via the `behavior` field.
     *  Note that `deployment` is overridden by `versioning_override` if the latter is present.
     *  Deprecated. Use `version`.
     */
    deployment: z
      .any()
      .describe(
        'The worker deployment that completed the last workflow task of this workflow execution. Must\n be present if `behavior` is set. Absent value means no workflow task is completed, or the\n last workflow task was completed by an unversioned worker. Unversioned workers may still send\n a deployment value which will be stored here, so the right way to check if an execution is\n versioned if an execution is versioned or not is via the `behavior` field.\n Note that `deployment` is overridden by `versioning_override` if the latter is present.\n Deprecated. Use `version`.',
      )
      .optional(),
    /**
     * The Worker Deployment Version that completed the last workflow task of this workflow
     *  execution, in the form "<deployment_name>.<build_id>".
     *  Must be present if and only if `behavior` is set. An absent value means no workflow task is
     *  completed, or the workflow is unversioned.
     *  For child workflows of Pinned parents, this will be set to parent's Pinned Version when the
     *  the child starts so that child's first workflow task goes to the same Version as the parent.
     *  Note that if `versioning_override.behavior` is PINNED then `versioning_override.pinned_version`
     *  will override this value.
     */
    version: z
      .string()
      .describe(
        'The Worker Deployment Version that completed the last workflow task of this workflow\n execution, in the form "<deployment_name>.<build_id>".\n Must be present if and only if `behavior` is set. An absent value means no workflow task is\n completed, or the workflow is unversioned.\n For child workflows of Pinned parents, this will be set to parent\'s Pinned Version when the\n the child starts so that child\'s first workflow task goes to the same Version as the parent.\n Note that if `versioning_override.behavior` is PINNED then `versioning_override.pinned_version`\n will override this value.',
      )
      .optional(),
    /**
     * Present if user has set an execution-specific versioning override. This override takes
     *  precedence over SDK-sent `behavior` (and `version` when override is PINNED). An
     *  override can be set when starting a new execution, as well as afterwards by calling the
     *  `UpdateWorkflowExecutionOptions` API.
     *  Pinned overrides are automatically inherited by child workflows.
     */
    versioningOverride: z
      .any()
      .describe(
        'Present if user has set an execution-specific versioning override. This override takes\n precedence over SDK-sent `behavior` (and `version` when override is PINNED). An\n override can be set when starting a new execution, as well as afterwards by calling the\n `UpdateWorkflowExecutionOptions` API.\n Pinned overrides are automatically inherited by child workflows.',
      )
      .optional(),
    /**
     * When present, indicates the workflow is transitioning to a different deployment. Can
     *  indicate one of the following transitions: unversioned -> versioned, versioned -> versioned
     *  on a different deployment, or versioned -> unversioned.
     *  Not applicable to workflows with PINNED behavior.
     *  When a workflow with AUTO_UPGRADE behavior creates a new workflow task, it will automatically
     *  start a transition to the task queue's current deployment if the task queue's current
     *  deployment is different from the workflow's deployment.
     *  If the AUTO_UPGRADE workflow is stuck due to backlogged activity or workflow tasks, those
     *  tasks will be redirected to the task queue's current deployment. As soon as a poller from
     *  that deployment is available to receive the task, the workflow will automatically start a
     *  transition to that deployment and continue execution there.
     *  A deployment transition can only exist while there is a pending or started workflow task.
     *  Once the pending workflow task completes on the transition's target deployment, the
     *  transition completes and the workflow's `deployment` and `behavior` fields are updated per
     *  the worker's task completion response.
     *  Pending activities will not start new attempts during a transition. Once the transition is
     *  completed, pending activities will start their next attempt on the new deployment.
     *  Deprecated. Use version_transition.
     */
    deploymentTransition: z
      .any()
      .describe(
        "When present, indicates the workflow is transitioning to a different deployment. Can\n indicate one of the following transitions: unversioned -> versioned, versioned -> versioned\n on a different deployment, or versioned -> unversioned.\n Not applicable to workflows with PINNED behavior.\n When a workflow with AUTO_UPGRADE behavior creates a new workflow task, it will automatically\n start a transition to the task queue's current deployment if the task queue's current\n deployment is different from the workflow's deployment.\n If the AUTO_UPGRADE workflow is stuck due to backlogged activity or workflow tasks, those\n tasks will be redirected to the task queue's current deployment. As soon as a poller from\n that deployment is available to receive the task, the workflow will automatically start a\n transition to that deployment and continue execution there.\n A deployment transition can only exist while there is a pending or started workflow task.\n Once the pending workflow task completes on the transition's target deployment, the\n transition completes and the workflow's `deployment` and `behavior` fields are updated per\n the worker's task completion response.\n Pending activities will not start new attempts during a transition. Once the transition is\n completed, pending activities will start their next attempt on the new deployment.\n Deprecated. Use version_transition.",
      )
      .optional(),
    /**
     * When present, indicates the workflow is transitioning to a different deployment version
     *  (which may belong to the same deployment name or another). Can indicate one of the following
     *  transitions: unversioned -> versioned, versioned -> versioned
     *  on a different deployment version, or versioned -> unversioned.
     *  Not applicable to workflows with PINNED behavior.
     *  When a workflow with AUTO_UPGRADE behavior creates a new workflow task, it will automatically
     *  start a transition to the task queue's current version if the task queue's current version is
     *  different from the workflow's current deployment version.
     *  If the AUTO_UPGRADE workflow is stuck due to backlogged activity or workflow tasks, those
     *  tasks will be redirected to the task queue's current version. As soon as a poller from
     *  that deployment version is available to receive the task, the workflow will automatically
     *  start a transition to that version and continue execution there.
     *  A version transition can only exist while there is a pending or started workflow task.
     *  Once the pending workflow task completes on the transition's target version, the
     *  transition completes and the workflow's `behavior`, and `version` fields are updated per the
     *  worker's task completion response.
     *  Pending activities will not start new attempts during a transition. Once the transition is
     *  completed, pending activities will start their next attempt on the new version.
     */
    versionTransition: z
      .any()
      .describe(
        "When present, indicates the workflow is transitioning to a different deployment version\n (which may belong to the same deployment name or another). Can indicate one of the following\n transitions: unversioned -> versioned, versioned -> versioned\n on a different deployment version, or versioned -> unversioned.\n Not applicable to workflows with PINNED behavior.\n When a workflow with AUTO_UPGRADE behavior creates a new workflow task, it will automatically\n start a transition to the task queue's current version if the task queue's current version is\n different from the workflow's current deployment version.\n If the AUTO_UPGRADE workflow is stuck due to backlogged activity or workflow tasks, those\n tasks will be redirected to the task queue's current version. As soon as a poller from\n that deployment version is available to receive the task, the workflow will automatically\n start a transition to that version and continue execution there.\n A version transition can only exist while there is a pending or started workflow task.\n Once the pending workflow task completes on the transition's target version, the\n transition completes and the workflow's `behavior`, and `version` fields are updated per the\n worker's task completion response.\n Pending activities will not start new attempts during a transition. Once the transition is\n completed, pending activities will start their next attempt on the new version.",
      )
      .optional(),
  })
  .describe(
    'Holds all the information about worker versioning for a particular workflow execution.\n Experimental. Versioning info is experimental and might change in the future.',
  );
export type WorkflowExecutionVersioningInfo = z.infer<
  typeof WorkflowExecutionVersioningInfo
>;
