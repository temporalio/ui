import { z } from 'zod';

/**Callback to attach to various events in the system, e.g. workflow run completion.*/
export const Callback = z
  .object({ nexus: z.any().optional(), internal: z.any().optional() })
  .describe(
    'Callback to attach to various events in the system, e.g. workflow run completion.',
  );
export type Callback = z.infer<typeof Callback>;
