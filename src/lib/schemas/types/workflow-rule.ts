import { z } from 'zod';

/**WorkflowRule describes a rule that can be applied to any workflow in this namespace.*/
export const WorkflowRule = z
  .object({
    /**Rule creation time.*/
    createTime: z
      .string()
      .datetime({ offset: true })
      .describe('Rule creation time.')
      .optional(),
    /**Rule specification*/
    spec: z.any().describe('Rule specification').optional(),
  })
  .describe(
    'WorkflowRule describes a rule that can be applied to any workflow in this namespace.',
  );
export type WorkflowRule = z.infer<typeof WorkflowRule>;
