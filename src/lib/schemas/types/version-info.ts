import { z } from 'zod';

/**VersionInfo contains details about current and recommended release versions as well as alerts and upgrade instructions.*/
export const VersionInfo = z
  .object({
    current: z.any().optional(),
    recommended: z.any().optional(),
    instructions: z.string().optional(),
    alerts: z.array(z.any()).optional(),
    lastUpdateTime: z.string().datetime({ offset: true }).optional(),
  })
  .describe(
    'VersionInfo contains details about current and recommended release versions as well as alerts and upgrade instructions.',
  );
export type VersionInfo = z.infer<typeof VersionInfo>;
