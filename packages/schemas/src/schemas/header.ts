import { z } from 'zod';

/**
 * Contains metadata that can be attached to a variety of requests, like starting a workflow, and
 *  can be propagated between, for example, workflows and activities.
 */
export const Header = z
  .object({ fields: z.record(z.any()).optional() })
  .describe(
    'Contains metadata that can be attached to a variety of requests, like starting a workflow, and\n can be propagated between, for example, workflows and activities.',
  );
export type Header = z.infer<typeof Header>;
