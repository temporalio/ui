import { z } from 'zod';

/**See `Payload`*/
export const Payloads = z
  .object({ payloads: z.array(z.any()).optional() })
  .describe('See `Payload`');
export type Payloads = z.infer<typeof Payloads>;
