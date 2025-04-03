import { z } from 'zod';

/**The outcome of a Workflow Update: success or failure.*/
export const Outcome = z
  .object({ success: z.any().optional(), failure: z.any().optional() })
  .describe('The outcome of a Workflow Update: success or failure.');
export type Outcome = z.infer<typeof Outcome>;
