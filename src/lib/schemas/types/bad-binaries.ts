import { z } from 'zod';

export const BadBinaries = z.object({ binaries: z.record(z.any()).optional() });
export type BadBinaries = z.infer<typeof BadBinaries>;
