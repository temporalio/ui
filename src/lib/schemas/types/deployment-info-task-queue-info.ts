import { z } from 'zod';

export const DeploymentInfo_TaskQueueInfo = z.object({
  name: z.string().optional(),
  type: z
    .enum([
      'TASK_QUEUE_TYPE_UNSPECIFIED',
      'TASK_QUEUE_TYPE_WORKFLOW',
      'TASK_QUEUE_TYPE_ACTIVITY',
      'TASK_QUEUE_TYPE_NEXUS',
    ])
    .optional(),
  /**When server saw the first poller for this task queue in this deployment.*/
  firstPollerTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      'When server saw the first poller for this task queue in this deployment.',
    )
    .optional(),
});
export type DeploymentInfo_TaskQueueInfo = z.infer<
  typeof DeploymentInfo_TaskQueueInfo
>;
