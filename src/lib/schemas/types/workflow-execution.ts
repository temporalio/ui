import { z } from 'zod';

/**
 * Identifies a specific workflow within a namespace. Practically speaking, because run_id is a
 *  uuid, a workflow execution is globally unique. Note that many commands allow specifying an empty
 *  run id as a way of saying "target the latest run of the workflow".
 */
export const WorkflowExecution = z
  .object({ workflowId: z.string().optional(), runId: z.string().optional() })
  .describe(
    'Identifies a specific workflow within a namespace. Practically speaking, because run_id is a\n uuid, a workflow execution is globally unique. Note that many commands allow specifying an empty\n run id as a way of saying "target the latest run of the workflow".',
  );
export type WorkflowExecution = z.infer<typeof WorkflowExecution>;
