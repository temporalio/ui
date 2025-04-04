import { z } from 'zod';

/**Deprecated. Use `InternalTaskQueueStatus`. This is kept until `DescribeTaskQueue` supports legacy behavior.*/
export const TaskQueueStatus = z
  .object({
    backlogCountHint: z.string().optional(),
    readLevel: z.string().optional(),
    ackLevel: z.string().optional(),
    ratePerSecond: z.number().optional(),
    taskIdBlock: z.any().optional(),
  })
  .describe(
    'Deprecated. Use `InternalTaskQueueStatus`. This is kept until `DescribeTaskQueue` supports legacy behavior.',
  );
export type TaskQueueStatus = z.infer<typeof TaskQueueStatus>;
