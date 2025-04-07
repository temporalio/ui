import { z } from 'zod';

/**
 * Priority contains metadata that controls relative ordering of task processing
 *  when tasks are backlogged in a queue. Initially, Priority will be used in
 *  activity and workflow task queues, which are typically where backlogs exist.
 *  Other queues in the server (such as transfer and timer queues) and rate
 *  limiting decisions do not use Priority, but may in the future.
 *
 *  Priority is attached to workflows and activities. Activities and child
 *  workflows inherit Priority from the workflow that created them, but may
 *  override fields when they are started or modified. For each field of a
 *  Priority on an activity/workflow, not present or equal to zero/empty string
 *  means to inherit the value from the calling workflow, or if there is no
 *  calling workflow, then use the default (documented below).
 *
 *  Despite being named "Priority", this message will also contains fields that
 *  control "fairness" mechanisms.
 *
 *  The overall semantics of Priority are:
 *  1. First, consider "priority_key": lower number goes first.
 *  (more will be added here later)
 */
export const Priority = z
  .object({
    /**
     * Priority key is a positive integer from 1 to n, where smaller integers
     *  correspond to higher priorities (tasks run sooner). In general, tasks in
     *  a queue should be processed in close to priority order, although small
     *  deviations are possible.
     *
     *  The maximum priority value (minimum priority) is determined by server
     *  configuration, and defaults to 5.
     *
     *  The default priority is (min+max)/2. With the default max of 5 and min of
     *  1, that comes out to 3.
     */
    priorityKey: z
      .number()
      .int()
      .describe(
        'Priority key is a positive integer from 1 to n, where smaller integers\n correspond to higher priorities (tasks run sooner). In general, tasks in\n a queue should be processed in close to priority order, although small\n deviations are possible.\n\n The maximum priority value (minimum priority) is determined by server\n configuration, and defaults to 5.\n\n The default priority is (min+max)/2. With the default max of 5 and min of\n 1, that comes out to 3.',
      )
      .optional(),
  })
  .describe(
    'Priority contains metadata that controls relative ordering of task processing\n when tasks are backlogged in a queue. Initially, Priority will be used in\n activity and workflow task queues, which are typically where backlogs exist.\n Other queues in the server (such as transfer and timer queues) and rate\n limiting decisions do not use Priority, but may in the future.\n\n Priority is attached to workflows and activities. Activities and child\n workflows inherit Priority from the workflow that created them, but may\n override fields when they are started or modified. For each field of a\n Priority on an activity/workflow, not present or equal to zero/empty string\n means to inherit the value from the calling workflow, or if there is no\n calling workflow, then use the default (documented below).\n\n Despite being named "Priority", this message will also contains fields that\n control "fairness" mechanisms.\n\n The overall semantics of Priority are:\n 1. First, consider "priority_key": lower number goes first.\n (more will be added here later)',
  );
export type Priority = z.infer<typeof Priority>;
