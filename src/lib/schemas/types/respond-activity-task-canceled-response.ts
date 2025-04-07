import { z } from 'zod';

export const RespondActivityTaskCanceledResponse = z.object({});
export type RespondActivityTaskCanceledResponse = z.infer<
  typeof RespondActivityTaskCanceledResponse
>;
