import { z } from 'zod';

export const VersionMetadata = z.object({
  /**Arbitrary key-values.*/
  entries: z.record(z.any()).describe('Arbitrary key-values.').optional(),
});
export type VersionMetadata = z.infer<typeof VersionMetadata>;
