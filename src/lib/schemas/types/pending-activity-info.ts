import { z } from 'zod';

export const PendingActivityInfo = z.object({
  activityId: z.string().optional(),
  activityType: z.any().optional(),
  state: z
    .enum([
      'PENDING_ACTIVITY_STATE_UNSPECIFIED',
      'PENDING_ACTIVITY_STATE_SCHEDULED',
      'PENDING_ACTIVITY_STATE_STARTED',
      'PENDING_ACTIVITY_STATE_CANCEL_REQUESTED',
      'PENDING_ACTIVITY_STATE_PAUSED',
      'PENDING_ACTIVITY_STATE_PAUSE_REQUESTED',
    ])
    .optional(),
  heartbeatDetails: z.any().optional(),
  lastHeartbeatTime: z.string().datetime({ offset: true }).optional(),
  lastStartedTime: z.string().datetime({ offset: true }).optional(),
  attempt: z.number().int().optional(),
  maximumAttempts: z.number().int().optional(),
  scheduledTime: z.string().datetime({ offset: true }).optional(),
  expirationTime: z.string().datetime({ offset: true }).optional(),
  lastFailure: z.any().optional(),
  lastWorkerIdentity: z.string().optional(),
  /**
   * This means the activity is independently versioned and not bound to the build ID of its workflow.
   *  The activity will use the build id in this field instead.
   *  If the task fails and is scheduled again, the assigned build ID may change according to the latest versioning
   *  rules.
   */
  lastIndependentlyAssignedBuildId: z
    .string()
    .describe(
      'This means the activity is independently versioned and not bound to the build ID of its workflow.\n The activity will use the build id in this field instead.\n If the task fails and is scheduled again, the assigned build ID may change according to the latest versioning\n rules.',
    )
    .optional(),
  /**
   * The version stamp of the worker to whom this activity was most recently dispatched
   *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
   */
  lastWorkerVersionStamp: z
    .any()
    .describe(
      'The version stamp of the worker to whom this activity was most recently dispatched\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
    )
    .optional(),
  /**
   * The time activity will wait until the next retry.
   *  If activity is currently running it will be next retry interval if activity failed.
   *  If activity is currently waiting it will be current retry interval.
   *  If there will be no retry it will be null.
   */
  currentRetryInterval: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'The time activity will wait until the next retry.\n If activity is currently running it will be next retry interval if activity failed.\n If activity is currently waiting it will be current retry interval.\n If there will be no retry it will be null.',
    )
    .optional(),
  /**The time when the last activity attempt was completed. If activity has not been completed yet then it will be null.*/
  lastAttemptCompleteTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      'The time when the last activity attempt was completed. If activity has not been completed yet then it will be null.',
    )
    .optional(),
  /**
   * Next time when activity will be scheduled.
   *  If activity is currently scheduled or started it will be null.
   */
  nextAttemptScheduleTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Next time when activity will be scheduled.\n If activity is currently scheduled or started it will be null.',
    )
    .optional(),
  /**Indicates if activity is paused.*/
  paused: z.boolean().describe('Indicates if activity is paused.').optional(),
  /**
   * The deployment this activity was dispatched to most recently. Present only if the activity
   *  was dispatched to a versioned worker.
   *  Deprecated. Use `last_worker_deployment_version`.
   */
  lastDeployment: z
    .any()
    .describe(
      'The deployment this activity was dispatched to most recently. Present only if the activity\n was dispatched to a versioned worker.\n Deprecated. Use `last_worker_deployment_version`.',
    )
    .optional(),
  /**The Worker Deployment Version this activity was dispatched to most recently.*/
  lastWorkerDeploymentVersion: z
    .string()
    .describe(
      'The Worker Deployment Version this activity was dispatched to most recently.',
    )
    .optional(),
  /**Priority metadata*/
  priority: z.any().describe('Priority metadata').optional(),
});
export type PendingActivityInfo = z.infer<typeof PendingActivityInfo>;
