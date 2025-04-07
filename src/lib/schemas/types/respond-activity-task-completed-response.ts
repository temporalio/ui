import { z } from 'zod';

export const RespondActivityTaskCompletedResponse = z.object({});
export type RespondActivityTaskCompletedResponse = z.infer<
  typeof RespondActivityTaskCompletedResponse
>;
