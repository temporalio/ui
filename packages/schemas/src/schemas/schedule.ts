import { z } from 'zod';

export const Schedule = z.object({
  spec: z.any().optional(),
  action: z.any().optional(),
  policies: z.any().optional(),
  state: z.any().optional(),
});
export type Schedule = z.infer<typeof Schedule>;
