import { z } from 'zod';

/**The data needed by a client to refer to a previously invoked Workflow Update.*/
export const UpdateRef = z
  .object({
    workflowExecution: z.any().optional(),
    updateId: z.string().optional(),
  })
  .describe(
    'The data needed by a client to refer to a previously invoked Workflow Update.',
  );
export type UpdateRef = z.infer<typeof UpdateRef>;
