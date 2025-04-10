import { z } from 'zod';

/**Experimental. Worker Deployments are experimental and might significantly change in the future.*/
export const TaskQueueVersioningInfo = z
  .object({
    /**
     * Always present. Specifies which Deployment Version should receive new workflow
     *  executions and tasks of existing unversioned or AutoUpgrade workflows.
     *  Can be one of the following:
     *  - A Deployment Version identifier in the form "<deployment_name>.<build_id>".
     *  - Or, the "__unversioned__" special value, to represent all the unversioned workers (those
     *    with `UNVERSIONED` (or unspecified) `WorkerVersioningMode`.)
     *  Note: Current Version is overridden by the Ramping Version for a portion of traffic when a ramp
     *  is set (see `ramping_version`.)
     */
    currentVersion: z
      .string()
      .describe(
        'Always present. Specifies which Deployment Version should receive new workflow\n executions and tasks of existing unversioned or AutoUpgrade workflows.\n Can be one of the following:\n - A Deployment Version identifier in the form "<deployment_name>.<build_id>".\n - Or, the "__unversioned__" special value, to represent all the unversioned workers (those\n   with `UNVERSIONED` (or unspecified) `WorkerVersioningMode`.)\n Note: Current Version is overridden by the Ramping Version for a portion of traffic when a ramp\n is set (see `ramping_version`.)',
      )
      .optional(),
    /**
     * When present, it means the traffic is being shifted from the Current Version to the Ramping
     *  Version.
     *  Must always be different from `current_version`. Can be one of the following:
     *  - A Deployment Version identifier in the form "<deployment_name>.<build_id>".
     *  - Or, the "__unversioned__" special value, to represent all the unversioned workers (those
     *    with `UNVERSIONED` (or unspecified) `WorkerVersioningMode`.)
     *  Note that it is possible to ramp from one Version to another Version, or from unversioned
     *  workers to a particular Version, or from a particular Version to unversioned workers.
     */
    rampingVersion: z
      .string()
      .describe(
        'When present, it means the traffic is being shifted from the Current Version to the Ramping\n Version.\n Must always be different from `current_version`. Can be one of the following:\n - A Deployment Version identifier in the form "<deployment_name>.<build_id>".\n - Or, the "__unversioned__" special value, to represent all the unversioned workers (those\n   with `UNVERSIONED` (or unspecified) `WorkerVersioningMode`.)\n Note that it is possible to ramp from one Version to another Version, or from unversioned\n workers to a particular Version, or from a particular Version to unversioned workers.',
      )
      .optional(),
    /**
     * Percentage of tasks that are routed to the Ramping Version instead of the Current Version.
     *  Valid range: [0, 100]. A 100% value means the Ramping Version is receiving full traffic but
     *  not yet "promoted" to be the Current Version, likely due to pending validations.
     */
    rampingVersionPercentage: z
      .number()
      .describe(
        'Percentage of tasks that are routed to the Ramping Version instead of the Current Version.\n Valid range: [0, 100]. A 100% value means the Ramping Version is receiving full traffic but\n not yet "promoted" to be the Current Version, likely due to pending validations.',
      )
      .optional(),
    /**Last time versioning information of this Task Queue changed.*/
    updateTime: z
      .string()
      .datetime({ offset: true })
      .describe('Last time versioning information of this Task Queue changed.')
      .optional(),
  })
  .describe(
    'Experimental. Worker Deployments are experimental and might significantly change in the future.',
  );
export type TaskQueueVersioningInfo = z.infer<typeof TaskQueueVersioningInfo>;
