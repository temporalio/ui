import { z } from 'zod';

/**A user-defined set of *unindexed* fields that are exposed when listing/searching workflows*/
export const Memo = z
  .object({ fields: z.record(z.any()).optional() })
  .describe(
    'A user-defined set of *unindexed* fields that are exposed when listing/searching workflows',
  );
export type Memo = z.infer<typeof Memo>;
