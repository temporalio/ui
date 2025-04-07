import { z } from 'zod';

export const PauseActivityResponse = z.object({});
export type PauseActivityResponse = z.infer<typeof PauseActivityResponse>;
