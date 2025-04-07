import { z } from 'zod';

export const TaskQueueTypeInfo = z.object({
  /**Unversioned workers (with `useVersioning=false`) are reported in unversioned result even if they set a Build ID.*/
  pollers: z
    .array(z.any())
    .describe(
      'Unversioned workers (with `useVersioning=false`) are reported in unversioned result even if they set a Build ID.',
    )
    .optional(),
  stats: z.any().optional(),
});
export type TaskQueueTypeInfo = z.infer<typeof TaskQueueTypeInfo>;
