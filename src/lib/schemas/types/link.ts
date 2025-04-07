import { z } from 'zod';

/**
 * Link can be associated with history events. It might contain information about an external entity
 *  related to the history event. For example, workflow A makes a Nexus call that starts workflow B:
 *  in this case, a history event in workflow A could contain a Link to the workflow started event in
 *  workflow B, and vice-versa.
 */
export const Link = z
  .object({ workflowEvent: z.any().optional(), batchJob: z.any().optional() })
  .describe(
    'Link can be associated with history events. It might contain information about an external entity\n related to the history event. For example, workflow A makes a Nexus call that starts workflow B:\n in this case, a history event in workflow A could contain a Link to the workflow started event in\n workflow B, and vice-versa.',
  );
export type Link = z.infer<typeof Link>;
