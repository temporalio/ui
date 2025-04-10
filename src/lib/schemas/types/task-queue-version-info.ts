import { z } from 'zod';

export const TaskQueueVersionInfo = z.object({
  /**Task Queue info per Task Type. Key is the numerical value of the temporal.api.enums.v1.TaskQueueType enum.*/
  typesInfo: z
    .record(z.any())
    .describe(
      'Task Queue info per Task Type. Key is the numerical value of the temporal.api.enums.v1.TaskQueueType enum.',
    )
    .optional(),
  /**
   * Task Reachability is eventually consistent; there may be a delay until it converges to the most
   *  accurate value but it is designed in a way to take the more conservative side until it converges.
   *  For example REACHABLE is more conservative than CLOSED_WORKFLOWS_ONLY.
   *
   *  Note: future activities who inherit their workflow's Build ID but not its Task Queue will not be
   *  accounted for reachability as server cannot know if they'll happen as they do not use
   *  assignment rules of their Task Queue. Same goes for Child Workflows or Continue-As-New Workflows
   *  who inherit the parent/previous workflow's Build ID but not its Task Queue. In those cases, make
   *  sure to query reachability for the parent/previous workflow's Task Queue as well.
   */
  taskReachability: z
    .enum([
      'BUILD_ID_TASK_REACHABILITY_UNSPECIFIED',
      'BUILD_ID_TASK_REACHABILITY_REACHABLE',
      'BUILD_ID_TASK_REACHABILITY_CLOSED_WORKFLOWS_ONLY',
      'BUILD_ID_TASK_REACHABILITY_UNREACHABLE',
    ])
    .describe(
      "Task Reachability is eventually consistent; there may be a delay until it converges to the most\n accurate value but it is designed in a way to take the more conservative side until it converges.\n For example REACHABLE is more conservative than CLOSED_WORKFLOWS_ONLY.\n\n Note: future activities who inherit their workflow's Build ID but not its Task Queue will not be\n accounted for reachability as server cannot know if they'll happen as they do not use\n assignment rules of their Task Queue. Same goes for Child Workflows or Continue-As-New Workflows\n who inherit the parent/previous workflow's Build ID but not its Task Queue. In those cases, make\n sure to query reachability for the parent/previous workflow's Task Queue as well.",
    )
    .optional(),
});
export type TaskQueueVersionInfo = z.infer<typeof TaskQueueVersionInfo>;
