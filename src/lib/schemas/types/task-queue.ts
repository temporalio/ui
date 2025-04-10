import { z } from 'zod';

/**See https://docs.temporal.io/docs/concepts/task-queues/*/
export const TaskQueue = z
  .object({
    name: z.string().optional(),
    /**Default: TASK_QUEUE_KIND_NORMAL.*/
    kind: z
      .enum([
        'TASK_QUEUE_KIND_UNSPECIFIED',
        'TASK_QUEUE_KIND_NORMAL',
        'TASK_QUEUE_KIND_STICKY',
      ])
      .describe('Default: TASK_QUEUE_KIND_NORMAL.')
      .optional(),
    /**
     * Iff kind == TASK_QUEUE_KIND_STICKY, then this field contains the name of
     *  the normal task queue that the sticky worker is running on.
     */
    normalName: z
      .string()
      .describe(
        'Iff kind == TASK_QUEUE_KIND_STICKY, then this field contains the name of\n the normal task queue that the sticky worker is running on.',
      )
      .optional(),
  })
  .describe('See https://docs.temporal.io/docs/concepts/task-queues/');
export type TaskQueue = z.infer<typeof TaskQueue>;
