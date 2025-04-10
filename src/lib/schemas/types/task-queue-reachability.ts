import { z } from 'zod';

/**Reachability of tasks for a worker on a single task queue.*/
export const TaskQueueReachability = z
  .object({
    taskQueue: z.string().optional(),
    /**
     * Task reachability for a worker in a single task queue.
     *  See the TaskReachability docstring for information about each enum variant.
     *  If reachability is empty, this worker is considered unreachable in this task queue.
     */
    reachability: z
      .array(
        z.enum([
          'TASK_REACHABILITY_UNSPECIFIED',
          'TASK_REACHABILITY_NEW_WORKFLOWS',
          'TASK_REACHABILITY_EXISTING_WORKFLOWS',
          'TASK_REACHABILITY_OPEN_WORKFLOWS',
          'TASK_REACHABILITY_CLOSED_WORKFLOWS',
        ]),
      )
      .describe(
        'Task reachability for a worker in a single task queue.\n See the TaskReachability docstring for information about each enum variant.\n If reachability is empty, this worker is considered unreachable in this task queue.',
      )
      .optional(),
  })
  .describe('Reachability of tasks for a worker on a single task queue.');
export type TaskQueueReachability = z.infer<typeof TaskQueueReachability>;
